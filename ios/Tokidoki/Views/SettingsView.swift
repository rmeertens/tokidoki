import SwiftUI

struct SettingsView: View {
    @Bindable private var settings = AppSettings.shared
    @State private var confirmingReset = false
    private var progress: ProgressStore { .shared }

    var body: some View {
        Form {
            Section {
                Toggle(isOn: $settings.typingMode) {
                    SettingLabel("Type answers", "Type the conjugation before revealing the answer")
                }
                Toggle(isOn: $settings.hideForm) {
                    SettingLabel("Hide form name", "Harder: only the English hint tells you which form to use")
                }
                Toggle(isOn: $settings.englishToJapanese) {
                    SettingLabel("English → Japanese", "See an English phrase (\"I didn't eat\") and produce the conjugation")
                }
                Toggle(isOn: $settings.showContext) {
                    SettingLabel("Show context example", "An English gloss below the hint, e.g. \"I did eat (polite, past)\"")
                }
                Toggle(isOn: $settings.showExampleFront) {
                    SettingLabel("Example sentence on question", "A Japanese sentence with the answer blanked out")
                }
            } header: {
                Text("Conjugation drills")
            }

            Section("Appearance") {
                Picker("Theme", selection: $settings.appearance) {
                    ForEach(AppSettings.Appearance.allCases) { Text($0.label).tag($0) }
                }
                .pickerStyle(.segmented)
            }

            Section("Japanese text") {
                Toggle(isOn: $settings.showFurigana) {
                    SettingLabel("Show furigana", "Readings above kanji in sentences and particle questions")
                }
            }

            Section("Your progress") {
                LabeledContent("Day streak", value: "\(progress.currentStreak)")
                LabeledContent("Reviewed today", value: "\(progress.todayReviews)")
                LabeledContent("Total reviews", value: "\(progress.stats.totalReviews)")
                LabeledContent("Cards studied", value: "\(progress.cards.count)")
                Button("Reset All Progress", role: .destructive) { confirmingReset = true }
                    .confirmationDialog("Reset all progress?", isPresented: $confirmingReset, titleVisibility: .visible) {
                        Button("Reset Everything", role: .destructive) { progress.resetAll() }
                    } message: {
                        Text("This clears every card's schedule, your stats and your streak.")
                    }
            }

            Section {
                Text("Everything is bundled in the app and works offline.")
                Link("tokidoki.meertens.dev", destination: URL(string: "https://tokidoki.meertens.dev")!)
            } header: {
                Text("About")
            } footer: {
                Text("Kanji readings and meanings from KANJIDIC2 (EDRDG, CC BY-SA 4.0). JLPT vocabulary from elzup/jlpt-word-list (MIT).")
            }
        }
        .navigationTitle("Settings")
    }
}

private struct SettingLabel: View {
    let title: String
    let detail: String

    init(_ title: String, _ detail: String) {
        self.title = title
        self.detail = detail
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
            Text(detail).font(.caption).foregroundStyle(.secondary)
        }
    }
}
