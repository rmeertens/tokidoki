import SwiftUI

struct KanjiQuizCard: @MainActor StudyCard, Hashable {
    nonisolated enum Direction: String, CaseIterable { case meaningToKanji = "meaning-to-kanji", kanjiToMeaning = "kanji-to-meaning" }

    let id: String
    let level: JLPTLevel
    let direction: Direction
    let entry: KanjiEntry

    static func pool(levels: Set<JLPTLevel>, direction: Direction) -> [KanjiQuizCard] {
        JLPTLevel.allCases.filter(levels.contains).flatMap { level in
            (Library.shared.kanji[level] ?? []).map {
                KanjiQuizCard(id: "kanjiquiz_\(level.rawValue)_\(direction.rawValue)_\($0.kanji)", level: level, direction: direction, entry: $0)
            }
        }
    }
}

struct SimilarKanjiCard: @MainActor StudyCard, Hashable {
    let id: String
    let kanji: String
    let meaning: String
    let level: JLPTLevel
    let groupIndex: Int

    static let all: [SimilarKanjiCard] = Library.shared.confusableGroups.enumerated().flatMap { index, group in
        group.kanji.compactMap { kanji in
            guard let meaning = group.meanings[kanji], let level = group.levels[kanji].flatMap({ JLPTLevel(rawValue: $0.lowercased()) }) else { return nil }
            return SimilarKanjiCard(id: "confusable_\(kanji)", kanji: kanji, meaning: meaning, level: level, groupIndex: index)
        }
    }

    static func pool(levels: Set<JLPTLevel>) -> [SimilarKanjiCard] { all.filter { levels.contains($0.level) } }

    /// The right meaning plus three from look-alike kanji in the same group (padded from other groups).
    func choices() -> [(kanji: String, meaning: String)] {
        let group = Library.shared.confusableGroups[groupIndex]
        var picked = group.kanji.filter { $0 != kanji }.shuffled().prefix(3).compactMap { other in
            group.meanings[other].map { (kanji: other, meaning: $0) }
        }
        var used = Set([meaning] + picked.map(\.meaning))
        for filler in Self.all.shuffled() where picked.count < 3 && !used.contains(filler.meaning) {
            picked.append((filler.kanji, filler.meaning))
            used.insert(filler.meaning)
        }
        return ([(kanji, meaning)] + picked).shuffled()
    }
}

struct KanjiQuizSetupView: View {
    enum QuizType: String, CaseIterable { case flashcards = "Flashcards", similar = "Look-alikes" }

    @State private var type = QuizType.flashcards
    @State private var direction = KanjiQuizCard.Direction.meaningToKanji
    @State private var levels: Set<JLPTLevel> = [.n5]
    private var progress: ProgressStore { .shared }

    private var poolIDs: [String] {
        type == .flashcards
            ? KanjiQuizCard.pool(levels: levels, direction: direction).map(\.id)
            : SimilarKanjiCard.pool(levels: levels).map(\.id)
    }

    var body: some View {
        Form {
            Section {
                Picker("Quiz type", selection: $type) {
                    ForEach(QuizType.allCases, id: \.self) { Text($0.rawValue) }
                }
                .pickerStyle(.segmented)
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets())
            } footer: {
                Text(type == .flashcards
                     ? "Self-graded flashcards, scheduled with spaced repetition so you review what you don't know most often."
                     : "Multiple choice built from kanji that look alike — the wrong answers are meanings of similar-looking kanji.")
            }

            if type == .flashcards {
                Section("Direction") {
                    Picker("Direction", selection: $direction) {
                        Text("Meaning → Kanji").tag(KanjiQuizCard.Direction.meaningToKanji)
                        Text("Kanji → Meaning").tag(KanjiQuizCard.Direction.kanjiToMeaning)
                    }
                    .pickerStyle(.inline)
                    .labelsHidden()
                }
            }

            Section("JLPT levels") {
                HStack(spacing: 8) {
                    ForEach(JLPTLevel.allCases) { level in
                        ToggleChip(title: level.label, isOn: Binding(get: { levels.contains(level) }, set: { _ in
                            if !levels.contains(level) || levels.count > 1 { levels.toggle(level) }
                        }))
                    }
                }
                .padding(.vertical, 4)
            }

            Section {
                LabeledContent("Kanji", value: "\(poolIDs.count)")
                LabeledContent("Due now", value: "\(progress.dueCount(poolIDs))")
            }
        }
        .navigationTitle("Kanji Quiz")
        .safeAreaInset(edge: .bottom) {
            ActionBar {
                NavigationLink {
                    if type == .flashcards {
                        KanjiFlashcardSessionView(levels: levels, direction: direction)
                    } else {
                        SimilarKanjiSessionView(levels: levels)
                    }
                } label: {
                    Label("Start", systemImage: "play.fill").frame(maxWidth: .infinity)
                }
                .buttonStyle(.glassProminent)
                .controlSize(.large)
                .disabled(poolIDs.isEmpty)
            }
        }
    }
}

// MARK: - Flashcards

struct KanjiFlashcardSessionView: View {
    let levels: Set<JLPTLevel>
    let direction: KanjiQuizCard.Direction
    @State private var session: StudySession<KanjiQuizCard>?

    var body: some View {
        Group {
            if let session {
                if session.isFinished {
                    SessionCompleteView(reviewed: session.index, correct: session.correct) { start() }
                } else if let card = session.current {
                    KanjiFlashcardView(card: card, session: session).id("\(session.index)-\(card.id)")
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle("Kanji Quiz")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if let session, !session.isFinished {
                ToolbarItem(placement: .topBarTrailing) {
                    UndoButton(isEnabled: session.canUndo) { withAnimation { session.undo() } }
                }
            }
        }
        .onAppear { if session == nil { start() } }
    }

    private func start() {
        session = StudySession(cards: StudySession.pick(from: KanjiQuizCard.pool(levels: levels, direction: direction)))
    }
}

private struct KanjiFlashcardView: View {
    let card: KanjiQuizCard
    let session: StudySession<KanjiQuizCard>
    @State private var revealed = false

    private var meaningFirst: Bool { card.direction == .meaningToKanji }

    var body: some View {
        VStack(spacing: 0) {
            SessionProgressBar(index: session.index, total: session.total, progress: session.progress)
            ScrollView {
                VStack(spacing: 20) {
                    HStack {
                        Text(meaningFirst ? "Recall the kanji" : "Recall the meaning")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Spacer()
                        Tag(text: card.level.label, tint: .purple)
                    }
                    side(showKanji: !meaningFirst)
                    if revealed {
                        Divider()
                        side(showKanji: meaningFirst)
                        if let info = Library.shared.kanjiInfo[card.entry.kanji], !info.readings.isEmpty {
                            Text(info.readings).font(.callout).foregroundStyle(.secondary).multilineTextAlignment(.center)
                        }
                    }
                }
                .cardBackground(accent: .purple)
                .padding()
                .animation(.snappy, value: revealed)
            }
        }
        .safeAreaInset(edge: .bottom) {
            ActionBar {
                if revealed {
                    GradeButtons(againTitle: "Didn't know", easyTitle: "Got it") { grade in
                        withAnimation { session.grade(grade, correct: grade == .easy) }
                    }
                } else {
                    PrimaryActionButton(title: "Show Answer", systemImage: "eye") { withAnimation(.snappy) { revealed = true } }
                }
            }
        }
    }

    @ViewBuilder
    private func side(showKanji: Bool) -> some View {
        if showKanji {
            Text(card.entry.kanji).font(.system(size: 110))
        } else {
            Text(card.entry.meaning).font(.title.weight(.semibold)).multilineTextAlignment(.center).padding(.vertical, 20)
        }
    }
}

// MARK: - Look-alike kanji

struct SimilarKanjiSessionView: View {
    let levels: Set<JLPTLevel>
    @State private var session: StudySession<SimilarKanjiCard>?

    var body: some View {
        Group {
            if let session {
                if session.isFinished {
                    SessionCompleteView(reviewed: session.index, correct: session.correct) { start() }
                } else if let card = session.current {
                    SimilarKanjiQuestionView(card: card, session: session).id("\(session.index)-\(card.id)")
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle("Look-alike Kanji")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if let session, !session.isFinished {
                ToolbarItem(placement: .topBarTrailing) {
                    UndoButton(isEnabled: session.canUndo) { withAnimation { session.undo() } }
                }
            }
        }
        .onAppear { if session == nil { start() } }
    }

    private func start() {
        session = StudySession(cards: StudySession.pick(from: SimilarKanjiCard.pool(levels: levels)))
    }
}

private struct SimilarKanjiQuestionView: View {
    let card: SimilarKanjiCard
    let session: StudySession<SimilarKanjiCard>

    @State private var choices: [(kanji: String, meaning: String)] = []
    @State private var chosen: String?

    private var isCorrect: Bool { chosen == card.kanji }

    var body: some View {
        VStack(spacing: 0) {
            SessionProgressBar(index: session.index, total: session.total, progress: session.progress)
            ScrollView {
                VStack(spacing: 20) {
                    VStack(spacing: 8) {
                        HStack {
                            Text("What does this kanji mean?").font(.subheadline).foregroundStyle(.secondary)
                            Spacer()
                            Tag(text: card.level.label, tint: .pink)
                        }
                        Text(card.kanji).font(.system(size: 110))
                    }
                    .cardBackground(accent: .pink)

                    VStack(spacing: 10) {
                        ForEach(choices, id: \.kanji) { choice in
                            ChoiceButton(state: state(for: choice.kanji), action: { choose(choice.kanji) }) {
                                HStack {
                                    Text(choice.meaning).font(.body.weight(.medium)).multilineTextAlignment(.leading)
                                    Spacer()
                                    if chosen != nil {
                                        Text(choice.kanji).font(.title)
                                    }
                                }
                            }
                        }
                    }
                }
                .padding()
            }
        }
        .safeAreaInset(edge: .bottom) {
            if chosen != nil {
                ActionBar {
                    PrimaryActionButton(title: "Next", systemImage: "arrow.right") {
                        withAnimation { session.grade(isCorrect ? .easy : .again, correct: isCorrect) }
                    }
                }
            }
        }
        .sensoryFeedback(trigger: chosen) { _, new in new == nil ? nil : (new == card.kanji ? .success : .error) }
        .onAppear { choices = card.choices() }
    }

    private func state(for kanji: String) -> ChoiceState {
        guard let chosen else { return .idle }
        if kanji == card.kanji { return .correct }
        return kanji == chosen ? .wrong : .disabled
    }

    private func choose(_ kanji: String) {
        guard chosen == nil else { return }
        withAnimation(.snappy) { chosen = kanji }
    }
}
