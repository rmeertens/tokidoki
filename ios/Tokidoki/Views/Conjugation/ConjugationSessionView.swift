import SwiftUI

/// A conjugation flashcard session (verbs, adjectives, or a custom mix).
struct ConjugationSessionView: View {
    let title: String
    let limit: Int
    let makePool: () -> [ConjugationCard]

    @State private var session: StudySession<ConjugationCard>?

    var body: some View {
        Group {
            if let session {
                if session.isFinished {
                    SessionCompleteView(reviewed: session.index, correct: session.correct) { start() }
                } else if let card = session.current {
                    ConjugationCardView(card: card, session: session)
                        .id("\(session.index)-\(card.id)")
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle(title)
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
        session = StudySession(cards: StudySession.pick(from: makePool(), limit: limit), requeuesMisses: true)
    }
}

private struct ConjugationCardView: View {
    let card: ConjugationCard
    let session: StudySession<ConjugationCard>

    @State private var revealed = false
    @State private var showHint = false
    @State private var typed = ""
    @State private var typedCorrect: Bool?
    @FocusState private var inputFocused: Bool

    private var settings: AppSettings { .shared }
    private var answers: [String] { Library.shared.conjugator.answers(card.word, card.form.key) }
    private var accent: Color { card.form.color }

    var body: some View {
        VStack(spacing: 0) {
            SessionProgressBar(index: session.index, total: session.total, progress: session.progress)
            ScrollView {
                VStack(spacing: 16) {
                    if revealed { back } else { front }
                    if showHint { hint }
                }
                .padding()
                .animation(.snappy, value: revealed)
            }
            .scrollDismissesKeyboard(.interactively)
        }
        .safeAreaInset(edge: .bottom) {
            ActionBar { actions }
        }
        .sensoryFeedback(trigger: typedCorrect) { _, new in
            new.map { $0 ? .success : .error }
        }
        .onAppear { if settings.typingMode { inputFocused = true } }
    }

    // MARK: Front

    private var front: some View {
        VStack(spacing: 14) {
            FormPill(form: card.form, hidden: settings.hideForm)
            if settings.englishToJapanese {
                Text(RichText.highlightingNegations(Library.shared.examples.hint(meaning: card.word.meaning, form: card.form.key)))
                    .font(.title2.weight(.semibold))
                    .multilineTextAlignment(.center)
                    .padding(.vertical, 12)
            } else {
                wordHeader
                Text("→ \(card.form.info.hint)")
                    .font(.headline)
                    .foregroundStyle(accent)
                if settings.showContext {
                    Text(RichText.highlightingNegations(Library.shared.examples.hint(meaning: card.word.meaning, form: card.form.key)))
                        .font(.callout)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
            }
            if settings.showExampleFront {
                exampleBox(Library.shared.examples.example(card.word, form: card.form.key, conjugated: nil))
            }
        }
        .cardBackground(accent: accent)
    }

    private var wordHeader: some View {
        VStack(spacing: 4) {
            Text(card.word.kanji).font(.system(size: 44, weight: .semibold))
            Text(card.word.reading).font(.title3).foregroundStyle(.secondary)
            Text(card.word.meaning).font(.subheadline).foregroundStyle(.secondary)
        }
    }

    // MARK: Back

    private var back: some View {
        let answer = answers[0]
        let parts = StudyText.answerParts(word: card.word, form: card.form.key, answer: answer)
        return VStack(spacing: 16) {
            FormPill(form: card.form)
            VStack(spacing: 2) {
                Text(card.word.kanji).font(.title3.weight(.semibold))
                Text("\(card.word.reading) · \(card.word.meaning)")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            Text(coloredAnswer(parts))
                .font(.system(size: 40, weight: .bold))
                .multilineTextAlignment(.center)
                .textSelection(.enabled)
            if answers.count > 1 {
                Text(answers[1]).font(.title3).foregroundStyle(.secondary)
            }
            Text(card.form.info.hint).font(.subheadline).foregroundStyle(.secondary)

            if let typedCorrect {
                Label {
                    Text(typed.isEmpty ? "(skipped)" : typed)
                } icon: {
                    Image(systemName: typedCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                }
                .font(.headline)
                .foregroundStyle(typedCorrect ? .green : .red)
            }

            if let explanation = StudyText.explanation(word: card.word, form: card.form.key) {
                InfoBox(title: "How it's formed", systemImage: "lightbulb") {
                    Text(RichText.inline(explanation.rule)).font(.callout)
                    Text(RichText.inline(explanation.steps)).font(.title3)
                }
            }
            exampleBox(Library.shared.examples.example(card.word, form: card.form.key, conjugated: answer))
        }
        .cardBackground(accent: accent)
    }

    /// Unchanged stem dimmed, changed kana in the primary color, new ending in the form color.
    private func coloredAnswer(_ parts: StudyText.AnswerParts) -> AttributedString {
        var stem = AttributedString(parts.stem)
        stem.foregroundColor = .secondary
        var changed = AttributedString(parts.changed)
        changed.foregroundColor = .primary
        var ending = AttributedString(parts.ending)
        ending.foregroundColor = accent
        return stem + changed + ending
    }

    private var hint: some View {
        InfoBox(title: "Hint", systemImage: "questionmark.circle") {
            ForEach(StudyText.hintSteps(word: card.word, form: card.form), id: \.self) { step in
                Text(RichText.inline("→ " + step)).font(.callout)
            }
        }
    }

    @ViewBuilder
    private func exampleBox(_ example: ExampleSentences.Example?) -> some View {
        if let example {
            InfoBox(title: "Example", systemImage: "text.quote") {
                FuriganaText(furigana: example.ja, showReadings: settings.showFurigana, font: .title3, alignment: .leading)
                Text(RichText.highlightingNegations(example.en)).font(.callout).foregroundStyle(.secondary)
            }
        }
    }

    // MARK: Actions

    @ViewBuilder
    private var actions: some View {
        if revealed {
            GradeButtons { grade in
                withAnimation {
                    let correct = typedCorrect ?? (grade == .easy)
                    session.grade(grade, correct: correct)
                }
            }
        } else if settings.typingMode {
            HStack(spacing: 10) {
                TextField("Type in hiragana…", text: $typed)
                    .font(.title3)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .focused($inputFocused)
                    .submitLabel(.done)
                    .onSubmit(check)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .glassEffect(.regular, in: .capsule)
                Button("Check", systemImage: "return", action: check)
                    .labelStyle(.iconOnly)
                    .buttonStyle(.glassProminent)
                    .controlSize(.large)
            }
            secondaryRow
        } else {
            secondaryRow
            PrimaryActionButton(title: "Show Answer", systemImage: "eye") { reveal() }
        }
    }

    private var secondaryRow: some View {
        HStack {
            Button(showHint ? "Hide hint" : "Hint", systemImage: "lightbulb") {
                withAnimation { showHint.toggle() }
            }
            if settings.typingMode {
                Spacer()
                Button("Show Answer", systemImage: "eye") { reveal() }
            }
        }
        .buttonStyle(.glass)
    }

    private func check() {
        let normalized = StudyText.normalize(typed)
        typedCorrect = !normalized.isEmpty && answers.contains { StudyText.normalize($0) == normalized }
        reveal()
    }

    private func reveal() {
        if settings.typingMode, typedCorrect == nil { typedCorrect = false }
        inputFocused = false
        withAnimation(.snappy) { revealed = true }
    }
}
