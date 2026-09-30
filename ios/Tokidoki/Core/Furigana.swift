import SwiftUI

/// Japanese text split into plain runs and kanji runs with a reading.
struct Furigana: Hashable {
    struct Segment: Hashable {
        let base: String
        let reading: String?
    }

    let segments: [Segment]

    var plain: String { segments.map(\.base).joined() }
    var hasReadings: Bool { segments.contains { $0.reading != nil } }

    /// Parses `<ruby>漢字<rp>(</rp><rt>かんじ</rt><rp>)</rp></ruby>` markup.
    init(html: String) {
        let ruby = /<ruby>(.*?)(?:<rp>.*?<\/rp>)?<rt>(.*?)<\/rt>(?:<rp>.*?<\/rp>)?<\/ruby>/
        var segments: [Segment] = []
        var cursor = html.startIndex
        for match in html.matches(of: ruby) {
            Self.appendPlain(String(html[cursor..<match.range.lowerBound]), to: &segments)
            segments.append(Segment(base: RichText.plain(String(match.output.1)), reading: RichText.plain(String(match.output.2))))
            cursor = match.range.upperBound
        }
        Self.appendPlain(String(html[cursor...]), to: &segments)
        self.segments = segments
    }

    private static func appendPlain(_ html: String, to segments: inout [Segment]) {
        let text = RichText.decodeEntities(html.replacing(/<[^>]+>/, with: ""))
        if !text.isEmpty { segments.append(Segment(base: text, reading: nil)) }
    }
}

/// Japanese text with readings stacked above the kanji. Wraps like normal text.
struct FuriganaText: View {
    let furigana: Furigana
    var showReadings = true
    var font: Font = .title2
    var readingFont: Font = .caption
    var alignment: HorizontalAlignment = .center

    private struct Token: Identifiable {
        let id: Int
        let base: String
        let reading: String?
    }

    private var tokens: [Token] {
        var tokens: [Token] = []
        for segment in furigana.segments {
            if let reading = segment.reading {
                tokens.append(Token(id: tokens.count, base: segment.base, reading: reading))
            } else {
                for character in segment.base {
                    tokens.append(Token(id: tokens.count, base: String(character), reading: nil))
                }
            }
        }
        return tokens
    }

    var body: some View {
        if showReadings && furigana.hasReadings {
            FlowLayout(alignment: alignment, lineSpacing: 4) {
                ForEach(tokens) { token in
                    RubyLayout {
                        Text(token.reading ?? " ")
                            .font(readingFont)
                            .foregroundStyle(.secondary)
                            .opacity(token.reading == nil ? 0 : 1)
                            .lineLimit(1)
                            .minimumScaleFactor(RubyLayout.minimumReadingScale)
                        Text(token.base).font(font).fixedSize()
                    }
                }
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(furigana.plain)
        } else {
            Text(furigana.plain)
                .font(font)
                .multilineTextAlignment(alignment == .leading ? .leading : .center)
        }
    }
}

/// A reading stacked on its base text. The reading shrinks to fit over the base before it widens
/// the pair, so long readings don't push neighbouring characters apart.
private struct RubyLayout: Layout {
    static let minimumReadingScale: CGFloat = 0.7

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let reading = subviews[0].sizeThatFits(.unspecified)
        let base = subviews[1].sizeThatFits(.unspecified)
        return CGSize(width: max(base.width, reading.width * Self.minimumReadingScale), height: reading.height + base.height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let reading = subviews[0].sizeThatFits(.unspecified)
        let base = subviews[1].sizeThatFits(.unspecified)
        subviews[0].place(at: CGPoint(x: bounds.midX, y: bounds.minY), anchor: .top,
                          proposal: ProposedViewSize(width: bounds.width, height: reading.height))
        subviews[1].place(at: CGPoint(x: bounds.midX, y: bounds.minY + reading.height), anchor: .top,
                          proposal: ProposedViewSize(base))
    }
}

/// Left-to-right wrapping layout (centered or leading), used for furigana and chips.
struct FlowLayout: Layout {
    var alignment: HorizontalAlignment = .center
    var spacing: CGFloat = 0
    var lineSpacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let lines = lines(for: subviews, width: proposal.width ?? .infinity)
        let height = lines.reduce(0) { $0 + $1.height } + CGFloat(max(0, lines.count - 1)) * lineSpacing
        let width = lines.map(\.width).max() ?? 0
        return CGSize(width: proposal.width.map { min($0, width) } ?? width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for line in lines(for: subviews, width: bounds.width) {
            var x = alignment == .center ? bounds.minX + (bounds.width - line.width) / 2 : bounds.minX
            for index in line.indices {
                let size = subviews[index].sizeThatFits(.unspecified)
                subviews[index].place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
                x += size.width + spacing
            }
            y += line.height + lineSpacing
        }
    }

    private struct Line {
        var indices: [Int] = []
        var width: CGFloat = 0
        var height: CGFloat = 0
    }

    private func lines(for subviews: Subviews, width maxWidth: CGFloat) -> [Line] {
        var lines: [Line] = []
        var line = Line()
        for index in subviews.indices {
            let size = subviews[index].sizeThatFits(.unspecified)
            let added = line.indices.isEmpty ? size.width : line.width + spacing + size.width
            if added > maxWidth, !line.indices.isEmpty {
                lines.append(line)
                line = Line()
            }
            line.width = line.indices.isEmpty ? size.width : line.width + spacing + size.width
            line.height = max(line.height, size.height)
            line.indices.append(index)
        }
        if !line.indices.isEmpty { lines.append(line) }
        return lines
    }
}
