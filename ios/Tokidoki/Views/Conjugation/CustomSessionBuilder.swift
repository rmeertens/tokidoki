import SwiftUI

/// "Build Your Own": pick any mix of forms and words.
struct CustomSessionBuilder: View {
    @State private var selectedForms: Set<String> = []
    @State private var selectedWords: Set<String> = Set((Library.shared.verbs + Library.shared.adjectives).map(\.id))

    private let content = Library.shared
    private var allForms: [VerbForm] { content.verbForms + content.adjectiveForms }
    private var allWords: [Word] { content.verbs + content.adjectives }

    private var cardCount: Int { Self.pool(wordIDs: selectedWords, formKeys: selectedForms).count }

    var body: some View {
        Form {
            Section {
                ForEach(allForms) { form in
                    Toggle(isOn: binding(for: form.key, in: $selectedForms)) {
                        HStack {
                            FormPill(form: form, showName: false).font(.caption)
                            Text(form.info.name)
                        }
                    }
                }
            } header: {
                SelectAllHeader(title: "Forms", allSelected: selectedForms.count == allForms.count) { selectAll in
                    selectedForms = selectAll ? Set(allForms.map(\.key)) : []
                }
            } footer: {
                Text("Verb forms apply to verbs, adjective forms to adjectives.")
            }

            Section("Words") {
                NavigationLink {
                    WordPicker(words: allWords, selection: $selectedWords)
                } label: {
                    LabeledContent("Verbs & adjectives", value: "\(selectedWords.count) of \(allWords.count)")
                }
            }
        }
        .navigationTitle("Build Your Own")
        .safeAreaInset(edge: .bottom) {
            ActionBar {
                NavigationLink(value: ConjugationRoute.custom(Array(selectedWords), forms: Array(selectedForms))) {
                    Label(cardCount == 0 ? "Pick at least one form" : "Start · \(min(cardCount, 30)) cards", systemImage: "play.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.glassProminent)
                .controlSize(.large)
                .disabled(cardCount == 0)
            }
        }
    }

    static func pool(wordIDs: Set<String>, formKeys: Set<String>) -> [ConjugationCard] {
        let content = Library.shared
        let verbForms = content.verbForms.filter { formKeys.contains($0.key) }
        let adjectiveForms = content.adjectiveForms.filter { formKeys.contains($0.key) }
        return (content.verbs + content.adjectives)
            .filter { wordIDs.contains($0.id) }
            .flatMap { word in
                (word.type.isAdjective ? adjectiveForms : verbForms).map {
                    ConjugationCard(id: word.cardID(form: $0.key), word: word, form: $0)
                }
            }
    }
}

private func binding(for key: String, in set: Binding<Set<String>>) -> Binding<Bool> {
    Binding(
        get: { set.wrappedValue.contains(key) },
        set: { isOn in if isOn { set.wrappedValue.insert(key) } else { set.wrappedValue.remove(key) } }
    )
}

private struct SelectAllHeader: View {
    let title: String
    let allSelected: Bool
    let onChange: (Bool) -> Void

    var body: some View {
        HStack {
            Text(title)
            Spacer()
            Button(allSelected ? "Deselect All" : "Select All") { onChange(!allSelected) }
                .font(.caption.weight(.semibold))
                .textCase(nil)
        }
    }
}

private struct WordPicker: View {
    let words: [Word]
    @Binding var selection: Set<String>
    @State private var search = ""

    private var chapters: [Int] { Array(Set(words.map(\.chapter))).sorted() }

    private func words(in chapter: Int) -> [Word] {
        words.filter { word in
            word.chapter == chapter && (search.isEmpty
                || word.kanji.contains(search) || word.reading.contains(search)
                || word.meaning.localizedCaseInsensitiveContains(search))
        }
    }

    var body: some View {
        List {
            ForEach(chapters, id: \.self) { chapter in
                let chapterWords = words(in: chapter)
                if !chapterWords.isEmpty {
                    Section {
                        ForEach(chapterWords) { word in
                            Button {
                                selection.toggle(word.id)
                            } label: {
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(word.kanji).font(.body.weight(.medium))
                                        Text(word.meaning).font(.caption).foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                    Image(systemName: selection.contains(word.id) ? "checkmark.circle.fill" : "circle")
                                        .foregroundStyle(selection.contains(word.id) ? Color.accentColor : .secondary)
                                        .font(.title3)
                                }
                                .contentShape(.rect)
                            }
                            .buttonStyle(.plain)
                        }
                    } header: {
                        let ids = chapterWords.map(\.id)
                        SelectAllHeader(title: "Chapter \(chapter)", allSelected: ids.allSatisfy(selection.contains)) { selectAll in
                            if selectAll { selection.formUnion(ids) } else { selection.subtract(ids) }
                        }
                    }
                }
            }
        }
        .searchable(text: $search, prompt: "Search words")
        .navigationTitle("Words")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                let allIDs = words.map(\.id)
                Button(selection.count == allIDs.count ? "None" : "All") {
                    selection = selection.count == allIDs.count ? [] : Set(allIDs)
                }
            }
        }
    }
}
