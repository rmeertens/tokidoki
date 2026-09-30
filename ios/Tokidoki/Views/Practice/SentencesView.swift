import SwiftUI

struct SentenceCard: @MainActor StudyCard, Hashable {
    enum Direction { case englishToJapanese, japaneseToEnglish }

    let id: String
    let sentence: Sentence
    let direction: Direction

    /// Each sentence gets a random direction per session, like the website.
    static func session(chapter: Int) -> [SentenceCard] {
        (Library.shared.sentences[chapter] ?? []).enumerated().map { index, sentence in
            let direction: Direction = Bool.random() ? .englishToJapanese : .japaneseToEnglish
            let suffix = direction == .englishToJapanese ? "en-to-ja" : "ja-to-en"
            return SentenceCard(id: "tr_\(chapter)_\(index)_\(suffix)", sentence: sentence, direction: direction)
        }
        .shuffled()
    }
}

struct SentenceChaptersView: View {
    private let content = Library.shared

    var body: some View {
        List {
            ForEach(["Genki I", "Genki II"], id: \.self) { book in
                Section(book) {
                    ForEach(content.sentenceChapters.filter { $0.info.book == book }) { chapter in
                        NavigationLink {
                            SentenceSessionView(chapter: chapter)
                        } label: {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(chapter.info.title).font(.headline)
                                Text("\(content.sentences[chapter.number]?.count ?? 0) sentences · EN → JA and JA → EN")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 2)
                        }
                    }
                }
            }
        }
        .navigationTitle("Sentences")
    }
}

struct SentenceSessionView: View {
    let chapter: Chapter
    @State private var session: StudySession<SentenceCard>?

    var body: some View {
        Group {
            if let session {
                if session.isFinished {
                    SessionCompleteView(reviewed: session.index, correct: session.correct) { start() }
                } else if let card = session.current {
                    SentenceCardView(card: card, session: session).id("\(session.index)-\(card.id)")
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle(chapter.info.title)
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
        session = StudySession(cards: SentenceCard.session(chapter: chapter.number), requeuesMisses: true)
    }
}

private struct SentenceCardView: View {
    let card: SentenceCard
    let session: StudySession<SentenceCard>

    @State private var revealed = false
    @State private var typed = ""
    @FocusState private var inputFocused: Bool
    private var settings: AppSettings { .shared }

    private var toJapanese: Bool { card.direction == .englishToJapanese }
    private var japanese: Furigana { Furigana(html: card.sentence.jaHtml ?? card.sentence.ja) }

    var body: some View {
        VStack(spacing: 0) {
            SessionProgressBar(index: session.index, total: session.total, progress: session.progress)
            ScrollView {
                VStack(spacing: 18) {
                    Tag(text: toJapanese ? "English → Japanese" : "Japanese → English", tint: .accentColor)
                    source
                    Text(toJapanese ? "Translate to Japanese" : "Translate to English")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    if revealed {
                        Divider()
                        answer
                        if settings.typingMode, !typed.isEmpty {
                            InfoBox(title: "Your answer", systemImage: "pencil") { Text(typed) }
                        }
                    }
                }
                .cardBackground(accent: .teal)
                .padding()
                .animation(.snappy, value: revealed)
            }
            .scrollDismissesKeyboard(.interactively)
        }
        .safeAreaInset(edge: .bottom) {
            ActionBar {
                if revealed {
                    GradeButtons { grade in withAnimation { session.grade(grade, correct: grade == .easy) } }
                } else {
                    if settings.typingMode {
                        TextField(toJapanese ? "Type in Japanese…" : "Type in English…", text: $typed, axis: .vertical)
                            .focused($inputFocused)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 12)
                            .glassEffect(.regular, in: .rect(cornerRadius: 22))
                    }
                    PrimaryActionButton(title: "Show Answer", systemImage: "eye") {
                        inputFocused = false
                        withAnimation(.snappy) { revealed = true }
                    }
                }
            }
        }
        .onAppear { if settings.typingMode { inputFocused = true } }
    }

    @ViewBuilder
    private var source: some View {
        if toJapanese {
            Text(card.sentence.en).font(.title2.weight(.semibold)).multilineTextAlignment(.center)
        } else {
            FuriganaText(furigana: japanese, showReadings: settings.showFurigana, font: .title2)
        }
    }

    @ViewBuilder
    private var answer: some View {
        if toJapanese {
            FuriganaText(furigana: japanese, showReadings: settings.showFurigana, font: .title2)
                .textSelection(.enabled)
        } else {
            Text(card.sentence.en).font(.title2.weight(.semibold)).multilineTextAlignment(.center)
        }
    }
}
