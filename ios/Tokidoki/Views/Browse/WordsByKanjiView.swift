import SwiftUI

/// Reverse lookup: pick a kanji to see every vocabulary word that uses it.
struct WordsByKanjiView: View {
    private struct Item: Identifiable, Hashable {
        let level: JLPTLevel
        let entry: KanjiEntry
        let wordCount: Int
        var id: String { entry.kanji }
    }

    @State private var levels: Set<JLPTLevel> = [.n5]
    @State private var search = ""
    @State private var selected: Item?

    private var items: [Item] {
        let index = Library.shared.wordsByKanji
        return JLPTLevel.allCases.filter(levels.contains).flatMap { level in
            (Library.shared.kanji[level] ?? [])
                .filter { search.isEmpty || $0.kanji == search || $0.meaning.localizedCaseInsensitiveContains(search) }
                .map { Item(level: level, entry: $0, wordCount: index[$0.kanji]?.count ?? 0) }
        }
    }

    var body: some View {
        let items = items
        ScrollView {
            Text("\(items.count) kanji · vocabulary covers N5–N3, so N2/N1 kanji often have none yet")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 104), spacing: 10)], spacing: 10) {
                ForEach(items) { item in
                    Button { selected = item } label: {
                        VStack(spacing: 4) {
                            Text(item.level.label)
                                .font(.caption2.weight(.semibold))
                                .foregroundStyle(.secondary)
                                .frame(maxWidth: .infinity, alignment: .trailing)
                            Text(item.entry.kanji).font(.system(size: 40))
                            Text(item.entry.meaning).font(.caption).lineLimit(2).multilineTextAlignment(.center)
                            Text(item.wordCount == 0 ? "no words yet" : "\(item.wordCount) word\(item.wordCount == 1 ? "" : "s")")
                                .font(.caption2.weight(.semibold))
                                .foregroundStyle(item.wordCount == 0 ? Color.secondary : Color.accentColor)
                        }
                        .padding(10)
                        .frame(maxWidth: .infinity)
                        .background(.background.secondary, in: .rect(cornerRadius: 16))
                        .contentShape(.rect)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding()
        }
        .overlay {
            if items.isEmpty { ContentUnavailableView.search(text: search) }
        }
        .searchable(text: $search, prompt: "Kanji or meaning")
        .navigationTitle("Words by Kanji")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                LevelFilterMenu(levels: JLPTLevel.allCases, selection: $levels)
            }
        }
        .sheet(item: $selected) { item in
            NavigationStack { KanjiWordsSheet(kanji: item.entry) }
                .presentationDetents([.medium, .large])
        }
    }
}

private struct KanjiWordsSheet: View {
    let kanji: KanjiEntry
    @Environment(\.dismiss) private var dismiss
    @AppStorage("wbk_furigana") private var showFurigana = true

    private var words: [(level: JLPTLevel, word: VocabWord)] {
        (Library.shared.wordsByKanji[kanji.kanji] ?? []).sorted {
            (JLPTLevel.allCases.firstIndex(of: $0.level) ?? 0) < (JLPTLevel.allCases.firstIndex(of: $1.level) ?? 0)
        }
    }

    var body: some View {
        let info = Library.shared.kanjiInfo[kanji.kanji]
        List {
            Section {
                HStack(spacing: 16) {
                    Text(kanji.kanji).font(.system(size: 56))
                    VStack(alignment: .leading, spacing: 4) {
                        Text(info?.meaning ?? kanji.meaning).font(.headline)
                        if let readings = info?.readings, !readings.isEmpty {
                            Text(readings).font(.subheadline).foregroundStyle(.secondary)
                        }
                    }
                }
            }
            Section("\(words.count) words") {
                if words.isEmpty {
                    Text("No word in the N5–N3 vocabulary uses this kanji yet.").foregroundStyle(.secondary)
                }
                ForEach(Array(words.enumerated()), id: \.offset) { _, entry in
                    HStack(alignment: .center) {
                        FuriganaText(furigana: Furigana(html: entry.word.html), showReadings: showFurigana, font: .title3, readingFont: .caption2, alignment: .leading)
                        Spacer(minLength: 12)
                        VStack(alignment: .trailing, spacing: 2) {
                            Text(entry.word.meaning).font(.subheadline).multilineTextAlignment(.trailing)
                            Text(entry.level.label).font(.caption2.weight(.semibold)).foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
        .navigationTitle("Words using \(kanji.kanji)")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Toggle("Furigana", systemImage: "textformat.size.smaller.ja", isOn: $showFurigana)
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button("Done", systemImage: "checkmark") { dismiss() }
            }
        }
    }
}
