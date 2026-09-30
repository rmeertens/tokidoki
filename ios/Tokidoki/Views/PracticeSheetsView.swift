import PDFKit
import SwiftUI

/// The printable PDF worksheets, viewable and printable/shareable in-app.
struct PracticeSheetsView: View {
    private let content = Library.shared

    private struct Sheet: Identifiable, Hashable {
        let title: String
        let path: String
        var id: String { path }
    }

    private static let kanaSets: [(title: String, detail: String, file: String)] = [
        ("Hiragana", "104 characters", "hiragana"),
        ("Katakana", "104 characters", "katakana"),
        ("Common Hiragana Words", "Write whole words", "hiragana-words"),
        ("Common Katakana Words", "Write whole words", "katakana-words"),
    ]

    var body: some View {
        List {
            Section {
                ForEach(JLPTLevel.allCases) { level in
                    SheetGroup(title: level.label, detail: "\(content.kanji[level]?.count ?? 0) kanji", sheets: [
                        Sheet(title: "Practice", path: "kanji-sheets/tokidoki-kanji-\(level.rawValue).pdf"),
                        Sheet(title: "Meaning practice", path: "kanji-sheets/tokidoki-kanji-\(level.rawValue)-meaning.pdf"),
                        Sheet(title: "Answer key", path: "kanji-sheets/tokidoki-kanji-\(level.rawValue)-answers.pdf"),
                    ])
                }
            } header: {
                Text("JLPT Kanji")
            } footer: {
                Text("Practice: meaning shown, write the kanji. Meaning practice: kanji shown, write the meaning.")
            }

            Section("Hiragana & Katakana") {
                ForEach(Self.kanaSets, id: \.file) { set in
                    SheetGroup(title: set.title, detail: set.detail, sheets: [
                        Sheet(title: "Practice", path: "kana-sheets/tokidoki-\(set.file).pdf"),
                        Sheet(title: "Answer key", path: "kana-sheets/tokidoki-\(set.file)-answers.pdf"),
                    ])
                }
            }

            ForEach(["Genki I", "Genki II"], id: \.self) { book in
                Section("Translation · \(book)") {
                    ForEach(content.sentenceChapters.filter { $0.info.book == book }) { chapter in
                        let prefix = "sentence-sheets/tokidoki-sentences-ch\(chapter.number)"
                        SheetGroup(title: chapter.info.title, detail: "\(content.sentences[chapter.number]?.count ?? 0) sentences", sheets: [
                            Sheet(title: "To English", path: "\(prefix)-to-english.pdf"),
                            Sheet(title: "To English · answers", path: "\(prefix)-to-english-answers.pdf"),
                            Sheet(title: "To Japanese", path: "\(prefix)-to-japanese.pdf"),
                            Sheet(title: "To Japanese · answers", path: "\(prefix)-to-japanese-answers.pdf"),
                        ])
                    }
                }
            }
        }
        .navigationTitle("Practice Sheets")
        .navigationDestination(for: Sheet.self) { sheet in
            PDFSheetView(title: sheet.title, url: content.pdfURL(sheet.path))
        }
    }

    private struct SheetGroup: View {
        let title: String
        let detail: String
        let sheets: [Sheet]

        var body: some View {
            DisclosureGroup {
                ForEach(sheets.filter { Library.shared.pdfURL($0.path) != nil }) { sheet in
                    NavigationLink(value: Sheet(title: "\(title) · \(sheet.title)", path: sheet.path)) {
                        Label(sheet.title, systemImage: sheet.title.localizedCaseInsensitiveContains("answer") ? "checkmark.seal" : "doc.text")
                    }
                }
            } label: {
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.body.weight(.medium))
                    Text(detail).font(.caption).foregroundStyle(.secondary)
                }
            }
        }
    }
}

struct PDFSheetView: View {
    let title: String
    let url: URL?

    var body: some View {
        Group {
            if let url {
                PDFKitView(url: url).ignoresSafeArea(edges: .bottom)
            } else {
                ContentUnavailableView("Sheet not found", systemImage: "doc.questionmark")
            }
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if let url {
                ToolbarItem(placement: .topBarTrailing) {
                    ShareLink(item: url) { Label("Share or print", systemImage: "square.and.arrow.up") }
                }
            }
        }
    }
}

private struct PDFKitView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> PDFView {
        let view = PDFView()
        view.autoScales = true
        view.displayMode = .singlePageContinuous
        view.backgroundColor = .secondarySystemBackground
        view.document = PDFDocument(url: url)
        return view
    }

    func updateUIView(_ view: PDFView, context: Context) {}
}
