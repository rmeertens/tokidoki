import SwiftUI

/// Kanji ↔ meaning cards with one side hidden until tapped.
struct KanjiBrowseView: View {
    private struct Item: Identifiable, Hashable {
        let level: JLPTLevel
        let entry: KanjiEntry
        var id: String { "\(level.rawValue)_\(entry.kanji)" }
    }

    @State private var levels: Set<JLPTLevel> = [.n5]
    @State private var kanjiFirst = true
    @State private var revealed: Set<String> = []
    @State private var revealAll = false
    @State private var shuffledOrder: [String]?
    @State private var search = ""

    private var items: [Item] {
        var items = JLPTLevel.allCases.filter(levels.contains).flatMap { level in
            (Library.shared.kanji[level] ?? []).map { Item(level: level, entry: $0) }
        }
        if let order = shuffledOrder {
            let rank = Dictionary(uniqueKeysWithValues: order.enumerated().map { ($1, $0) })
            items.sort { (rank[$0.id] ?? 0) < (rank[$1.id] ?? 0) }
        }
        guard !search.isEmpty else { return items }
        return items.filter { $0.entry.kanji == search || $0.entry.meaning.localizedCaseInsensitiveContains(search) }
    }

    var body: some View {
        let items = items
        ScrollView {
            Picker("Direction", selection: $kanjiFirst) {
                Text("Kanji → Meaning").tag(true)
                Text("Meaning → Kanji").tag(false)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)

            Text("\(items.count) kanji · tap a card to reveal it")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .padding(.top, 4)

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 104), spacing: 10)], spacing: 10) {
                ForEach(items) { item in
                    let isRevealed = revealAll || revealed.contains(item.id)
                    Button {
                        withAnimation(.snappy) { revealed.toggle(item.id) }
                    } label: {
                        RevealCard(level: item.level, isRevealed: isRevealed) {
                            face(item, kanji: kanjiFirst)
                        } answer: {
                            face(item, kanji: !kanjiFirst)
                        }
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
        .navigationTitle("Kanji")
        .toolbar {
            ToolbarItemGroup(placement: .topBarTrailing) {
                Button(revealAll ? "Hide all" : "Reveal all", systemImage: revealAll ? "eye.slash" : "eye") {
                    withAnimation { revealAll.toggle(); revealed = [] }
                }
                Menu("Options", systemImage: "ellipsis") {
                    Button("Shuffle", systemImage: "shuffle") { shuffledOrder = items.map(\.id).shuffled() }
                    Button("Original order", systemImage: "list.number") { shuffledOrder = nil }
                }
                LevelFilterMenu(levels: JLPTLevel.allCases, selection: $levels)
            }
        }
        .onChange(of: levels) { shuffledOrder = nil; revealed = [] }
        .onChange(of: kanjiFirst) { revealed = [] }
    }

    @ViewBuilder
    private func face(_ item: Item, kanji: Bool) -> some View {
        if kanji {
            Text(item.entry.kanji).font(.system(size: 40))
        } else {
            Text(item.entry.meaning)
                .font(.footnote.weight(.medium))
                .multilineTextAlignment(.center)
                .lineLimit(3)
                .minimumScaleFactor(0.8)
        }
    }
}

/// A card with a visible prompt and an answer that's blurred until revealed.
struct RevealCard<Prompt: View, Answer: View>: View {
    let level: JLPTLevel
    let isRevealed: Bool
    @ViewBuilder let prompt: Prompt
    @ViewBuilder let answer: Answer

    var body: some View {
        VStack(spacing: 6) {
            Text(level.label)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, alignment: .trailing)
            prompt.frame(minHeight: 48)
            Divider()
            answer
                .frame(minHeight: 48)
                .blur(radius: isRevealed ? 0 : 8)
                .opacity(isRevealed ? 1 : 0.35)
                .accessibilityHidden(!isRevealed)
        }
        .padding(10)
        .frame(maxWidth: .infinity)
        .background(.background.secondary, in: .rect(cornerRadius: 16))
        .contentShape(.rect)
        .accessibilityAddTraits(.isButton)
        .accessibilityHint(isRevealed ? "Hides the answer" : "Reveals the answer")
    }
}
