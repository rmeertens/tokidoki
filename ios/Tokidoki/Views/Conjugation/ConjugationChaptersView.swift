import SwiftUI

/// Genki chapter list for verb or adjective conjugation drills.
struct ConjugationChaptersView: View {
    let adjectives: Bool

    @State private var showingReference = false
    private let content = Library.shared
    private var progress: ProgressStore { .shared }

    private var chapters: [Chapter] { adjectives ? content.adjectiveChapters : content.verbChapters }

    var body: some View {
        List {
            Section {
                DueSummaryRow(due: chapters.reduce(0) { $0 + stats(for: $1).due })
            }
            ForEach(["Genki I", "Genki II"], id: \.self) { book in
                Section(book) {
                    ForEach(chapters.filter { $0.info.book == book }) { chapter in
                        NavigationLink(value: ConjugationRoute.chapter(chapter.number, adjectives: adjectives)) {
                            ChapterRow(chapter: chapter, adjectives: adjectives, stats: stats(for: chapter))
                        }
                    }
                }
            }
        }
        .navigationTitle(adjectives ? "Adjectives" : "Verbs")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Conjugation reference", systemImage: "book") { showingReference = true }
            }
        }
        .sheet(isPresented: $showingReference) {
            NavigationStack {
                ConjugationReferenceView(initialTab: adjectives ? .adjectives : .verbs)
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            Button("Done", systemImage: "checkmark") { showingReference = false }
                        }
                    }
            }
        }
    }

    struct ChapterStats {
        let words: Int
        let forms: Int
        let cards: Int
        let reviewed: Int
        let due: Int
        let iCount: Int
        let naCount: Int
    }

    private func stats(for chapter: Chapter) -> ChapterStats {
        let words = content.words(inChapter: chapter.number, adjectives: adjectives)
        let forms = content.conjugator.forms(forChapter: chapter.number, adjectives: adjectives)
        var reviewed = 0, due = 0
        for word in words {
            for form in forms {
                let id = word.cardID(form: form.key)
                let state = progress.state(id)
                if state.repetitions > 0 { reviewed += 1 }
                if state.isDue { due += 1 }
            }
        }
        return ChapterStats(
            words: words.count, forms: forms.count, cards: words.count * forms.count, reviewed: reviewed, due: due,
            iCount: words.filter { $0.type == .iAdjective }.count,
            naCount: words.filter { $0.type == .naAdjective }.count
        )
    }
}

private struct ChapterRow: View {
    let chapter: Chapter
    let adjectives: Bool
    let stats: ConjugationChaptersView.ChapterStats

    private var subtitle: String {
        if adjectives {
            let types = [stats.iCount > 0 ? "\(stats.iCount) い" : nil, stats.naCount > 0 ? "\(stats.naCount) な" : nil]
                .compactMap { $0 }.joined(separator: " · ")
            return "\(types) · \(stats.forms) forms"
        }
        return "\(stats.words) verbs · \(stats.forms) forms"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Text(chapter.info.title).font(.headline)
                Spacer()
                if stats.due > 0 {
                    Text("\(stats.due) due")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Color.accentColor)
                }
            }
            Text(subtitle).font(.subheadline).foregroundStyle(.secondary)
            let newForms = (chapter.info.newForms ?? []).compactMap { Library.shared.form($0) }
            if !newForms.isEmpty {
                FlowLayout(alignment: .leading, spacing: 6, lineSpacing: 6) {
                    ForEach(newForms) { FormPill(form: $0).font(.caption) }
                }
            }
            ProgressView(value: stats.cards > 0 ? Double(stats.reviewed) / Double(stats.cards) : 0)
                .tint(.green)
        }
        .padding(.vertical, 4)
    }
}

struct DueSummaryRow: View {
    let due: Int

    var body: some View {
        HStack {
            Label {
                Text(due > 0 ? "\(due) cards due for review" : "Nothing due — any chapter starts a fresh round")
            } icon: {
                Image(systemName: due > 0 ? "clock.badge.exclamationmark" : "checkmark.circle")
                    .foregroundStyle(due > 0 ? Color.orange : Color.green)
            }
            .font(.subheadline)
        }
    }
}

enum ConjugationRoute: Hashable {
    case chapter(Int, adjectives: Bool)
    case custom([String], forms: [String])
}

struct ConjugationCard: @MainActor StudyCard, Hashable {
    let id: String
    let word: Word
    let form: VerbForm

    static func pool(chapter: Int, adjectives: Bool) -> [ConjugationCard] {
        let content = Library.shared
        let forms = content.conjugator.forms(forChapter: chapter, adjectives: adjectives)
        return content.words(inChapter: chapter, adjectives: adjectives).flatMap { word in
            forms.map { ConjugationCard(id: word.cardID(form: $0.key), word: word, form: $0) }
        }
    }
}

extension View {
    func conjugationDestinations() -> some View {
        navigationDestination(for: ConjugationRoute.self) { route in
            switch route {
            case .chapter(let number, let adjectives):
                let title = (adjectives ? Library.shared.adjectiveChapters : Library.shared.verbChapters)
                    .first { $0.number == number }?.info.title ?? "Study"
                ConjugationSessionView(title: title, limit: 20) {
                    ConjugationCard.pool(chapter: number, adjectives: adjectives)
                }
            case .custom(let wordIDs, let formKeys):
                ConjugationSessionView(title: "Custom Session", limit: 30) {
                    CustomSessionBuilder.pool(wordIDs: Set(wordIDs), formKeys: Set(formKeys))
                }
            }
        }
    }
}
