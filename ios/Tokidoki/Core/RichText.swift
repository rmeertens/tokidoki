import SwiftUI

/// Converts the small HTML subset used in the site's data (explanations, hints,
/// furigana) into native text. Supported: p, div, br, b/strong, em, span.ex-hl,
/// table/thead/tr/th/td and ruby/rt/rp.
enum RichText {
    enum Block: Hashable {
        case paragraph(AttributedString, isNote: Bool)
        case table(header: [AttributedString], rows: [[AttributedString]], highlighted: Set<Int>)
    }

    static func blocks(_ html: String) -> [Block] {
        var parser = Parser()
        parser.run(html)
        return parser.blocks
    }

    /// All text joined into a single attributed string (paragraphs on separate lines).
    static func inline(_ html: String) -> AttributedString {
        var result = AttributedString()
        for block in blocks(html) {
            guard case .paragraph(let text, _) = block else { continue }
            if !result.characters.isEmpty { result.append(AttributedString("\n")) }
            result.append(text)
        }
        return result
    }

    static func plain(_ html: String) -> String {
        String(inline(html).characters)
    }

    static func decodeEntities(_ text: String) -> String {
        guard text.contains("&") else { return text }
        return text
            .replacingOccurrences(of: "&nbsp;", with: "\u{00A0}")
            .replacingOccurrences(of: "&ndash;", with: "–")
            .replacingOccurrences(of: "&mdash;", with: "—")
            .replacingOccurrences(of: "&middot;", with: "·")
            .replacingOccurrences(of: "&lt;", with: "<")
            .replacingOccurrences(of: "&gt;", with: ">")
            .replacingOccurrences(of: "&quot;", with: "\"")
            .replacingOccurrences(of: "&#39;", with: "'")
            .replacingOccurrences(of: "&amp;", with: "&")
    }

    /// Red emphasis on negations in English prompts ("I didn't eat").
    static func highlightingNegations(_ text: String) -> AttributedString {
        var result = AttributedString(text)
        let pattern = /(?i)\b(don't|didn't|not|wasn't|weren't)\b/
        for match in text.matches(of: pattern) {
            guard let lower = AttributedString.Index(match.range.lowerBound, within: result),
                  let upper = AttributedString.Index(match.range.upperBound, within: result) else { continue }
            result[lower..<upper].foregroundColor = .red
            result[lower..<upper].inlinePresentationIntent = .stronglyEmphasized
        }
        return result
    }

    private struct Parser {
        var blocks: [Block] = []

        private var paragraph = AttributedString()
        private var paragraphIsNote = false
        private var bold = 0
        private var italic = 0
        private var highlight = 0
        private var spanStack: [Bool] = []
        private var skipDepth = 0

        private var inTable = false
        private var inHeader = false
        private var header: [AttributedString] = []
        private var rows: [[AttributedString]] = []
        private var highlightedRows: Set<Int> = []
        private var row: [AttributedString]?
        private var rowHighlighted = false
        private var cell: AttributedString?

        mutating func run(_ html: String) {
            let tag = /<(\/?)([a-zA-Z0-9]+)([^>]*)>/
            var cursor = html.startIndex
            for match in html.matches(of: tag) {
                text(String(html[cursor..<match.range.lowerBound]))
                handle(tag: String(match.output.2).lowercased(), closing: !match.output.1.isEmpty, attributes: String(match.output.3))
                cursor = match.range.upperBound
            }
            text(String(html[cursor...]))
            endParagraph()
        }

        private mutating func handle(tag: String, closing: Bool, attributes: String) {
            switch (tag, closing) {
            case ("rp", false), ("rt", false): skipDepth += 1
            case ("rp", true), ("rt", true): skipDepth = max(0, skipDepth - 1)
            case ("p", false), ("div", false):
                endParagraph()
                paragraphIsNote = attributes.contains("conj-note")
            case ("p", true), ("div", true): endParagraph()
            case ("br", _): append("\n")
            case ("b", false), ("strong", false): bold += 1
            case ("b", true), ("strong", true): bold = max(0, bold - 1)
            case ("em", false), ("i", false): italic += 1
            case ("em", true), ("i", true): italic = max(0, italic - 1)
            case ("span", false):
                let isHighlight = attributes.contains("ex-hl")
                spanStack.append(isHighlight)
                if isHighlight { highlight += 1 }
            case ("span", true):
                if spanStack.popLast() == true { highlight = max(0, highlight - 1) }
            case ("table", false):
                endParagraph()
                inTable = true
                header = []; rows = []; highlightedRows = []
            case ("table", true):
                blocks.append(.table(header: header, rows: rows, highlighted: highlightedRows))
                inTable = false
            case ("thead", false): inHeader = true
            case ("thead", true): inHeader = false
            case ("tr", false):
                row = []
                rowHighlighted = attributes.contains("irr-row")
            case ("tr", true):
                if let finished = row {
                    if inHeader { header = finished } else {
                        if rowHighlighted { highlightedRows.insert(rows.count) }
                        rows.append(finished)
                    }
                }
                row = nil
            case ("td", false), ("th", false): cell = AttributedString()
            case ("td", true), ("th", true):
                if let finished = cell { row?.append(finished) }
                cell = nil
            default: break
            }
        }

        private mutating func text(_ raw: String) {
            guard skipDepth == 0, !raw.isEmpty else { return }
            let collapsed = raw.replacing(/\s+/, with: " ")
            if cell == nil, inTable { return }
            append(RichText.decodeEntities(collapsed))
        }

        private mutating func append(_ string: String) {
            var run = AttributedString(string)
            var intent: InlinePresentationIntent = []
            if bold > 0 || highlight > 0 { intent.insert(.stronglyEmphasized) }
            if italic > 0 { intent.insert(.emphasized) }
            if !intent.isEmpty { run.inlinePresentationIntent = intent }
            if highlight > 0 { run.foregroundColor = .accentColor }
            if cell != nil { cell?.append(run) } else { paragraph.append(run) }
        }

        private mutating func endParagraph() {
            let trimmed = String(paragraph.characters).trimmingCharacters(in: .whitespacesAndNewlines)
            if !trimmed.isEmpty { blocks.append(.paragraph(paragraph, isNote: paragraphIsNote)) }
            paragraph = AttributedString()
            paragraphIsNote = false
        }
    }
}

/// Renders `RichText` blocks: paragraphs, callout notes and conjugation tables.
struct RichTextView: View {
    let blocks: [RichText.Block]

    init(html: String) { blocks = RichText.blocks(html) }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(Array(blocks.enumerated()), id: \.offset) { _, block in
                switch block {
                case .paragraph(let text, let isNote):
                    if isNote {
                        Text(text)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(.fill.tertiary, in: .rect(cornerRadius: 10))
                    } else {
                        Text(text).font(.callout)
                    }
                case .table(let header, let rows, let highlighted):
                    table(header: header, rows: rows, highlighted: highlighted)
                }
            }
        }
    }

    private func table(header: [AttributedString], rows: [[AttributedString]], highlighted: Set<Int>) -> some View {
        Grid(alignment: .leading, horizontalSpacing: 10, verticalSpacing: 0) {
            if !header.isEmpty {
                GridRow {
                    ForEach(Array(header.enumerated()), id: \.offset) { _, cell in
                        Text(cell).font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 6)
                Divider()
            }
            ForEach(Array(rows.enumerated()), id: \.offset) { index, row in
                GridRow {
                    ForEach(Array(row.enumerated()), id: \.offset) { _, cell in
                        Text(cell).font(.footnote).fixedSize(horizontal: false, vertical: true)
                    }
                }
                .padding(.vertical, 6)
                .background(highlighted.contains(index) ? Color.accentColor.opacity(0.07) : .clear)
                if index < rows.count - 1 { Divider() }
            }
        }
        .padding(.horizontal, 10)
        .background(.fill.quaternary, in: .rect(cornerRadius: 10))
    }
}

extension Color {
    /// `#RRGGBB` from the site's form colors.
    init(hex: String) {
        let value = UInt64(hex.trimmingCharacters(in: CharacterSet(charactersIn: "#")), radix: 16) ?? 0x6C5CE7
        self.init(
            red: Double((value >> 16) & 0xFF) / 255,
            green: Double((value >> 8) & 0xFF) / 255,
            blue: Double(value & 0xFF) / 255
        )
    }
}

extension VerbForm {
    var color: Color { Color(hex: info.color) }
}
