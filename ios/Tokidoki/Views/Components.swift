import SwiftUI

/// Progress bar shown at the top of every study session.
struct SessionProgressBar: View {
    let index: Int
    let total: Int
    let progress: Double

    var body: some View {
        HStack(spacing: 12) {
            ProgressView(value: progress)
                .tint(.accentColor)
            Text("\(min(index + 1, total)) / \(total)")
                .font(.footnote.monospacedDigit())
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }
}

/// Toolbar undo button for re-grading the previous card.
struct UndoButton: View {
    let isEnabled: Bool
    let action: () -> Void

    var body: some View {
        Button("Undo last grade", systemImage: "arrow.uturn.backward", action: action)
            .disabled(!isEnabled)
    }
}

/// The two SRS grade buttons.
struct GradeButtons: View {
    var againTitle = "Again"
    var easyTitle = "Easy"
    let onGrade: (Grade) -> Void

    var body: some View {
        HStack(spacing: 12) {
            Button {
                onGrade(.again)
            } label: {
                Label(againTitle, systemImage: "arrow.counterclockwise")
                    .frame(maxWidth: .infinity)
            }
            .tint(.red)
            Button {
                onGrade(.easy)
            } label: {
                Label(easyTitle, systemImage: "checkmark")
                    .frame(maxWidth: .infinity)
            }
            .tint(.green)
        }
        .buttonStyle(.glassProminent)
        .controlSize(.large)
    }
}

/// A full-width primary action for the bottom bar.
struct PrimaryActionButton: View {
    let title: String
    var systemImage: String?
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Group {
                if let systemImage { Label(title, systemImage: systemImage) } else { Text(title) }
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.glassProminent)
        .controlSize(.large)
    }
}

/// Bottom bar container that floats above the content.
struct ActionBar<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        VStack(spacing: 10) { content }
            .padding(.horizontal)
            .padding(.top, 8)
            .padding(.bottom, 4)
    }
}

/// Summary shown when a session runs out of cards.
struct SessionCompleteView: View {
    let reviewed: Int
    let correct: Int
    let onRestart: () -> Void

    @Environment(\.dismiss) private var dismiss

    private var accuracy: Int { reviewed > 0 ? Int((Double(correct) / Double(reviewed) * 100).rounded()) : 0 }

    var body: some View {
        VStack(spacing: 28) {
            Spacer()
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 64))
                .foregroundStyle(.green)
                .symbolEffect(.bounce, value: reviewed)
            VStack(spacing: 6) {
                Text("Session complete").font(.title.bold())
                Text("Progress saved. Cards come back when they're due.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            HStack(spacing: 12) {
                StatTile(value: "\(reviewed)", label: "Reviewed")
                StatTile(value: "\(correct)", label: "Correct")
                StatTile(value: "\(accuracy)%", label: "Accuracy")
            }
            Spacer()
            VStack(spacing: 10) {
                PrimaryActionButton(title: "Study again", systemImage: "arrow.clockwise", action: onRestart)
                Button("Done") { dismiss() }
                    .buttonStyle(.glass)
                    .controlSize(.large)
            }
        }
        .padding()
    }
}

struct StatTile: View {
    let value: String
    let label: String
    var tint: Color = .accentColor

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2.bold().monospacedDigit())
                .foregroundStyle(tint)
                .contentTransition(.numericText())
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(.fill.tertiary, in: .rect(cornerRadius: 14))
    }
}

/// Colored pill for a conjugation form ("ます Polite").
struct FormPill: View {
    let form: VerbForm
    var showName = true
    var hidden = false

    var body: some View {
        HStack(spacing: 4) {
            if hidden {
                Text("?").bold()
            } else {
                Text(form.info.symbol).bold()
                if showName { Text(form.info.name) }
            }
        }
        .font(.subheadline)
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .foregroundStyle(form.color)
        .background(form.color.opacity(0.15), in: .capsule)
    }
}

/// Small uppercase tag like "N5" or "Hiragana".
struct Tag: View {
    let text: String
    var tint: Color = .secondary

    var body: some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .textCase(.uppercase)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .foregroundStyle(tint)
            .background(tint.opacity(0.14), in: .capsule)
    }
}

/// Rounded card surface used for flashcards.
struct CardBackground: ViewModifier {
    var accent: Color?

    func body(content: Content) -> some View {
        content
            .padding(20)
            .frame(maxWidth: .infinity)
            .background(.background.secondary, in: .rect(cornerRadius: 24))
            .overlay(alignment: .leading) {
                if let accent {
                    UnevenRoundedRectangle(topLeadingRadius: 24, bottomLeadingRadius: 24)
                        .fill(accent)
                        .frame(width: 5)
                }
            }
    }
}

extension View {
    func cardBackground(accent: Color? = nil) -> some View { modifier(CardBackground(accent: accent)) }
}

/// "Hint" / "Example" style box inside a card.
struct InfoBox<Content: View>: View {
    let title: String
    var systemImage: String?
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label {
                Text(title)
            } icon: {
                if let systemImage { Image(systemName: systemImage) }
            }
            .font(.caption.weight(.semibold))
            .textCase(.uppercase)
            .foregroundStyle(.secondary)
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(.fill.quaternary, in: .rect(cornerRadius: 14))
    }
}

/// Toolbar menu for choosing which JLPT levels to include.
struct LevelFilterMenu: View {
    let levels: [JLPTLevel]
    @Binding var selection: Set<JLPTLevel>

    var body: some View {
        Menu {
            ForEach(levels) { level in
                Toggle(level.label, isOn: Binding(
                    get: { selection.contains(level) },
                    set: { isOn in
                        if isOn { selection.insert(level) } else if selection.count > 1 { selection.remove(level) }
                    }
                ))
            }
        } label: {
            Label("Levels", systemImage: "line.3.horizontal.decrease.circle")
        }
        .menuActionDismissBehavior(.disabled)
    }
}

/// Selectable chip used for level/particle pickers on setup screens.
struct ToggleChip: View {
    let title: String
    @Binding var isOn: Bool

    var body: some View {
        Button {
            isOn.toggle()
        } label: {
            Text(title)
                .font(.body.weight(.medium))
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .foregroundStyle(isOn ? Color.white : Color.primary)
                .background(isOn ? Color.accentColor : Color.secondary.opacity(0.15), in: .capsule)
        }
        .buttonStyle(.plain)
        .sensoryFeedback(.selection, trigger: isOn)
    }
}

extension Set {
    mutating func toggle(_ member: Element) {
        if contains(member) { remove(member) } else { insert(member) }
    }
}
