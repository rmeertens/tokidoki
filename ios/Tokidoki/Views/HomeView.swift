import SwiftUI

enum Exercise: String, CaseIterable, Identifiable, Hashable {
    case verbs, adjectives, custom, sentences, particles, kana, kanjiQuiz

    var id: String { rawValue }

    var title: String {
        switch self {
        case .verbs: "Verbs"
        case .adjectives: "Adjectives"
        case .custom: "Build Your Own"
        case .sentences: "Sentences"
        case .particles: "Particles"
        case .kana: "Kana"
        case .kanjiQuiz: "Kanji Quiz"
        }
    }

    var subtitle: String {
        switch self {
        case .verbs: "Conjugation drills · Genki I & II"
        case .adjectives: "い & な adjective conjugation"
        case .custom: "Mix any verbs, adjectives & forms"
        case .sentences: "Translate full Japanese sentences"
        case .particles: "は, が, を, に, で & more"
        case .kana: "Draw hiragana & katakana"
        case .kanjiQuiz: "JLPT flashcards & look-alike kanji"
        }
    }

    var systemImage: String {
        switch self {
        case .verbs: "figure.run"
        case .adjectives: "paintpalette"
        case .custom: "slider.horizontal.3"
        case .sentences: "text.bubble"
        case .particles: "puzzlepiece"
        case .kana: "pencil.and.scribble"
        case .kanjiQuiz: "square.stack"
        }
    }

    var tint: Color {
        switch self {
        case .verbs: .blue
        case .adjectives: .pink
        case .custom: .indigo
        case .sentences: .teal
        case .particles: .orange
        case .kana: .green
        case .kanjiQuiz: .purple
        }
    }

    @ViewBuilder
    var destination: some View {
        switch self {
        case .verbs: ConjugationChaptersView(adjectives: false)
        case .adjectives: ConjugationChaptersView(adjectives: true)
        case .custom: CustomSessionBuilder()
        case .sentences: SentenceChaptersView()
        case .particles: ParticleSetupView()
        case .kana: KanaSetupView()
        case .kanjiQuiz: KanjiQuizSetupView()
        }
    }
}

struct HomeView: View {
    private var progress: ProgressStore { .shared }
    private let content = Library.shared

    private var dueVerbs: Int {
        content.verbChapters.reduce(0) { $0 + progress.dueCount(ConjugationCard.pool(chapter: $1.number, adjectives: false).map(\.id)) }
    }
    private var dueAdjectives: Int {
        content.adjectiveChapters.reduce(0) { $0 + progress.dueCount(ConjugationCard.pool(chapter: $1.number, adjectives: true).map(\.id)) }
    }
    private var dueKana: Int { progress.dueCount(KanaCard.pool(hiragana: true, katakana: true).map(\.id)) }

    var body: some View {
        let due: [Exercise: Int] = [.verbs: dueVerbs, .adjectives: dueAdjectives, .kana: dueKana]
        List {
            Section {
                HStack(spacing: 10) {
                    StatTile(value: "\(progress.todayReviews)", label: "Today")
                    StatTile(value: "\(progress.todayAccuracy)%", label: "Accuracy", tint: .green)
                    StatTile(value: "\(due.values.reduce(0, +))", label: "Due", tint: .orange)
                }
                .listRowInsets(EdgeInsets())
                .listRowBackground(Color.clear)
            } footer: {
                Text("Spaced repetition schedules each card, so you review what you need most.")
            }

            Section("Conjugation") { rows([.verbs, .adjectives, .custom], due: due) }
            Section("Grammar & Reading") { rows([.sentences, .particles], due: due) }
            Section("Writing") { rows([.kana], due: due) }
            Section("Kanji") { rows([.kanjiQuiz], due: due) }
        }
        .navigationTitle("Tokidoki")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                HStack(spacing: 4) {
                    Image(systemName: "flame.fill").foregroundStyle(.orange)
                    Text("\(progress.currentStreak)").font(.subheadline.weight(.semibold).monospacedDigit())
                }
                .padding(.horizontal, 6)
                .accessibilityElement(children: .ignore)
                .accessibilityLabel("\(progress.currentStreak) day streak")
            }
        }
        .navigationDestination(for: Exercise.self) { $0.destination }
        .conjugationDestinations()
    }

    private func rows(_ exercises: [Exercise], due: [Exercise: Int]) -> some View {
        ForEach(exercises) { exercise in
            NavigationLink(value: exercise) {
                IconRow(title: exercise.title, subtitle: exercise.subtitle, systemImage: exercise.systemImage, tint: exercise.tint) {
                    if let count = due[exercise], count > 0 {
                        Text("\(count)")
                            .font(.caption.weight(.semibold).monospacedDigit())
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .foregroundStyle(.white)
                            .background(Color.orange, in: .capsule)
                    }
                }
            }
        }
    }
}

/// Settings-app style row: tinted rounded icon, title, subtitle and trailing accessory.
struct IconRow<Accessory: View>: View {
    let title: String
    var subtitle: String?
    let systemImage: String
    let tint: Color
    @ViewBuilder var accessory: Accessory

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: systemImage)
                .font(.body.weight(.semibold))
                .foregroundStyle(.white)
                .frame(width: 34, height: 34)
                .background(tint.gradient, in: .rect(cornerRadius: 9))
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.body.weight(.medium))
                if let subtitle {
                    Text(subtitle).font(.caption).foregroundStyle(.secondary)
                }
            }
            Spacer(minLength: 8)
            accessory
        }
        .padding(.vertical, 2)
    }
}

extension IconRow where Accessory == EmptyView {
    init(title: String, subtitle: String? = nil, systemImage: String, tint: Color) {
        self.init(title: title, subtitle: subtitle, systemImage: systemImage, tint: tint) { EmptyView() }
    }
}
