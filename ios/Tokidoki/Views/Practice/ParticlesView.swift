import SwiftUI

struct ParticleCard: @MainActor StudyCard, Hashable {
    let id: String
    let item: ParticleItem

    static func pool(particles: Set<String>) -> [ParticleCard] {
        Library.shared.particleItems
            .filter { particles.contains($0.particle) }
            .map { ParticleCard(id: "particle_\($0.id)", item: $0) }
    }
}

struct ParticleSetupView: View {
    @State private var selected = Set(Library.shared.particles)
    private let content = Library.shared
    private var progress: ProgressStore { .shared }

    private var pool: [ParticleCard] { ParticleCard.pool(particles: selected) }

    var body: some View {
        Form {
            Section {
                Text("Each question shows a sentence with one particle missing plus its English translation. Pick the particle that fits.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }
            Section {
                FlowLayout(alignment: .leading, spacing: 8, lineSpacing: 8) {
                    ForEach(content.particles, id: \.self) { particle in
                        ToggleChip(
                            title: "\(particle)  \(content.particleRomaji[particle] ?? "")",
                            isOn: Binding(get: { selected.contains(particle) }, set: { _ in selected.toggle(particle) })
                        )
                    }
                }
                .padding(.vertical, 6)
            } header: {
                HStack {
                    Text("Particles")
                    Spacer()
                    Button(selected.count == content.particles.count ? "Deselect All" : "Select All") {
                        selected = selected.count == content.particles.count ? [] : Set(content.particles)
                    }
                    .font(.caption.weight(.semibold))
                    .textCase(nil)
                }
            } footer: {
                Text("Target mix-ups like に vs で vs へ by picking just those.")
            }
            Section {
                LabeledContent("Questions", value: "\(pool.count)")
                LabeledContent("Due now", value: "\(progress.dueCount(pool.map(\.id)))")
            }
        }
        .navigationTitle("Particles")
        .safeAreaInset(edge: .bottom) {
            ActionBar {
                NavigationLink {
                    ParticleSessionView(particles: selected)
                } label: {
                    Label("Start", systemImage: "play.fill").frame(maxWidth: .infinity)
                }
                .buttonStyle(.glassProminent)
                .controlSize(.large)
                .disabled(pool.isEmpty)
            }
        }
    }
}

struct ParticleSessionView: View {
    let particles: Set<String>
    @State private var session: StudySession<ParticleCard>?

    var body: some View {
        Group {
            if let session {
                if session.isFinished {
                    SessionCompleteView(reviewed: session.index, correct: session.correct) { start() }
                } else if let card = session.current {
                    ParticleQuestionView(card: card, session: session).id("\(session.index)-\(card.id)")
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle("Particles")
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
        session = StudySession(cards: StudySession.pick(from: ParticleCard.pool(particles: particles)))
    }
}

private struct ParticleQuestionView: View {
    let card: ParticleCard
    let session: StudySession<ParticleCard>

    @State private var choices: [String] = []
    @State private var chosen: String?
    private var settings: AppSettings { .shared }
    private var item: ParticleItem { card.item }
    private var isCorrect: Bool { chosen == item.particle }

    var body: some View {
        VStack(spacing: 0) {
            SessionProgressBar(index: session.index, total: session.total, progress: session.progress)
            ScrollView {
                VStack(spacing: 20) {
                    VStack(spacing: 14) {
                        sentence
                        Text(item.en).font(.callout).foregroundStyle(.secondary).multilineTextAlignment(.center)
                    }
                    .cardBackground(accent: .orange)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        ForEach(choices, id: \.self) { choice in
                            ChoiceButton(title: choice, state: state(for: choice)) { choose(choice) }
                                .font(.system(size: 30, weight: .semibold))
                        }
                    }

                    if let chosen, chosen != item.particle {
                        InfoBox(title: "Why \(item.particle)", systemImage: "info.circle") {
                            Text(Library.shared.particleExplanations[item.particle] ?? "").font(.callout)
                        }
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
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
        .sensoryFeedback(trigger: chosen) { _, new in new == nil ? nil : (new == item.particle ? .success : .error) }
        .onAppear {
            let distractors = (Library.shared.particleDistractors[item.particle] ?? []).shuffled().prefix(3)
            choices = ([item.particle] + distractors).shuffled()
        }
    }

    private var sentence: some View {
        let blank = chosen.map { _ in item.particle } ?? "＿"
        let html = (settings.showFurigana ? item.beforeHtml : item.beforePlain)
            + "〔\(blank)〕"
            + (settings.showFurigana ? item.afterHtml : item.afterPlain)
        return FuriganaText(furigana: Furigana(html: html), showReadings: settings.showFurigana, font: .title2)
    }

    private func state(for choice: String) -> ChoiceState {
        guard let chosen else { return .idle }
        if choice == item.particle { return .correct }
        return choice == chosen ? .wrong : .disabled
    }

    private func choose(_ choice: String) {
        guard chosen == nil else { return }
        withAnimation(.snappy) { chosen = choice }
    }
}

enum ChoiceState { case idle, correct, wrong, disabled }

/// Multiple-choice answer button that turns green/red once answered.
struct ChoiceButton<Label: View>: View {
    let state: ChoiceState
    let action: () -> Void
    @ViewBuilder let label: Label

    init(state: ChoiceState, action: @escaping () -> Void, @ViewBuilder label: () -> Label) {
        self.state = state
        self.action = action
        self.label = label()
    }

    private var tint: Color {
        switch state {
        case .idle, .disabled: .secondary
        case .correct: .green
        case .wrong: .red
        }
    }

    var body: some View {
        Button(action: action) {
            label
                .frame(maxWidth: .infinity, minHeight: 64)
                .padding(.vertical, 8)
                .padding(.horizontal, 10)
                .foregroundStyle(state == .idle ? Color.primary : state == .disabled ? Color.secondary : tint)
                .background(state == .idle || state == .disabled ? Color.secondary.opacity(0.12) : tint.opacity(0.18), in: .rect(cornerRadius: 18))
                .overlay {
                    RoundedRectangle(cornerRadius: 18).strokeBorder(tint.opacity(state == .idle || state == .disabled ? 0 : 0.8), lineWidth: 2)
                }
                .overlay(alignment: .topTrailing) {
                    if state == .correct || state == .wrong {
                        Image(systemName: state == .correct ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .font(.body)
                            .foregroundStyle(tint)
                            .padding(8)
                    }
                }
        }
        .buttonStyle(.plain)
        .allowsHitTesting(state == .idle)
    }
}

extension ChoiceButton where Label == Text {
    init(title: String, state: ChoiceState, action: @escaping () -> Void) {
        self.init(state: state, action: action) { Text(title) }
    }
}
