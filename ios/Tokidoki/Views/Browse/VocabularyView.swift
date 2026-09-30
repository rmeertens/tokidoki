import SwiftUI

/// JLPT N5–N3 vocabulary with one side hidden until tapped, plus a per-kanji breakdown.
struct VocabularyView: View {
    enum Script: String, CaseIterable { case kanji = "Kanji", furigana = "Furigana", kana = "Kana" }

    private struct Item: Identifiable, Hashable {
        let index: Int
        let level: JLPTLevel
        let word: VocabWord
        var id: Int { index }
    }

    @State private var levels: Set<JLPTLevel> = [.n5]
    @AppStorage("vocab_script") private var script = Script.kanji
    @State private var wordFirst = true
    @State private var revealed: Set<Int> = []
    @State private var shuffledOrder: [Int]?
    @State private var search = ""

    private static let allItems: [Item] = {
        var index = 0
        return JLPTLevel.vocabulary.flatMap { level in
            (Library.shared.vocabulary[level] ?? []).map { word in
                defer { index += 1 }
                return Item(index: index, level: level, word: word)
            }
        }
    }()

    private var items: [Item] {
        var items = Self.allItems.filter { levels.contains($0.level) }
        if let order = shuffledOrder {
            let rank = Dictionary(uniqueKeysWithValues: order.enumerated().map { ($1, $0) })
            items.sort { (rank[$0.id] ?? 0) < (rank[$1.id] ?? 0) }
        }
        guard !search.isEmpty else { return items }
        return items.filter {
            $0.word.kanji.contains(search) || $0.word.kana.contains(search) || $0.word.meaning.localizedCaseInsensitiveContains(search)
        }
    }

    var body: some View {
        let items = items
        List {
            Section {
                Picker("Direction", selection: $wordFirst) {
                    Text("Word → Meaning").tag(true)
                    Text("Meaning → Word").tag(false)
                }
                .pickerStyle(.segmented)
                Picker("Japanese shown as", selection: $script) {
                    ForEach(Script.allCases, id: \.self) { Text($0.rawValue) }
                }
            } footer: {
                Text("\(items.count) words · tap a word to reveal it and see its kanji")
            }

            Section {
                ForEach(items) { item in
                    VocabularyRow(
                        word: item.word, level: item.level, script: script, wordFirst: wordFirst,
                        isRevealed: revealed.contains(item.id)
                    )
                    .contentShape(.rect)
                    .onTapGesture { withAnimation(.snappy) { revealed.toggle(item.id) } }
                }
            }
        }
        .overlay {
            if items.isEmpty { ContentUnavailableView.search(text: search) }
        }
        .searchable(text: $search, prompt: "Word, reading or meaning")
        .navigationTitle("Vocabulary")
        .toolbar {
            ToolbarItemGroup(placement: .topBarTrailing) {
                Menu("Options", systemImage: "ellipsis") {
                    Button("Shuffle", systemImage: "shuffle") { shuffledOrder = items.map(\.id).shuffled() }
                    Button("Original order", systemImage: "list.number") { shuffledOrder = nil }
                    Button("Hide all", systemImage: "eye.slash") { revealed = [] }
                }
                LevelFilterMenu(levels: JLPTLevel.vocabulary, selection: $levels)
            }
        }
        .onChange(of: levels) { shuffledOrder = nil; revealed = [] }
        .onChange(of: wordFirst) { revealed = [] }
    }
}

private struct VocabularyRow: View {
    let word: VocabWord
    let level: JLPTLevel
    let script: VocabularyView.Script
    let wordFirst: Bool
    let isRevealed: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Group {
                    if wordFirst { japanese } else { meaning }
                }
                Spacer(minLength: 12)
                Text(level.label).font(.caption2.weight(.semibold)).foregroundStyle(.secondary)
            }
            Group {
                if wordFirst { meaning } else { japanese }
            }
            .blur(radius: isRevealed ? 0 : 7)
            .opacity(isRevealed ? 1 : 0.35)
            .accessibilityHidden(!isRevealed)

            if isRevealed { breakdown }
        }
        .padding(.vertical, 4)
    }

    @ViewBuilder
    private var japanese: some View {
        switch script {
        case .kana:
            Text(word.kana).font(.title2)
        case .furigana, .kanji:
            FuriganaText(
                furigana: Furigana(html: word.html),
                showReadings: script == .furigana || isRevealed,
                font: .title2, readingFont: .caption2, alignment: .leading
            )
        }
    }

    private var meaning: some View {
        Text(word.meaning).font(.body)
    }

    @ViewBuilder
    private var breakdown: some View {
        let info = Library.shared.kanjiInfo
        var seen = Set<Character>()
        let characters = word.kanji.filter { $0.isKanji && seen.insert($0).inserted && info[String($0)] != nil }
        if !characters.isEmpty {
            VStack(alignment: .leading, spacing: 6) {
                ForEach(Array(characters), id: \.self) { character in
                    let entry = info[String(character)]
                    HStack(alignment: .top, spacing: 10) {
                        Text(String(character)).font(.title3)
                        VStack(alignment: .leading, spacing: 1) {
                            if let meaning = entry?.meaning { Text(meaning).font(.caption.weight(.medium)) }
                            if let readings = entry?.readings, !readings.isEmpty {
                                Text(readings).font(.caption2).foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.fill.quaternary, in: .rect(cornerRadius: 10))
            .transition(.opacity)
        }
    }
}
