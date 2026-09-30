import SwiftUI

/// Every conjugation form with worked examples and the website's explanation tables.
struct ConjugationReferenceView: View {
    enum Tab: Hashable { case verbs, adjectives }

    @State private var tab: Tab
    private let content = Library.shared

    init(initialTab: Tab = .verbs) {
        _tab = State(initialValue: initialTab)
    }

    private static let examples: [Tab: [Word]] = [
        .verbs: [
            Word(kanji: "食べる", reading: "たべる", meaning: "to eat", type: .ru, chapter: 3, disambig: nil),
            Word(kanji: "書く", reading: "かく", meaning: "to write", type: .u, chapter: 4, disambig: nil),
            Word(kanji: "する", reading: "する", meaning: "to do", type: .irregular, chapter: 3, disambig: nil),
            Word(kanji: "くる", reading: "くる", meaning: "to come", type: .irregular, chapter: 3, disambig: nil),
        ],
        .adjectives: [
            Word(kanji: "高い", reading: "たかい", meaning: "expensive", type: .iAdjective, chapter: 5, disambig: nil),
            Word(kanji: "静か", reading: "しずか", meaning: "quiet", type: .naAdjective, chapter: 5, disambig: nil),
        ],
    ]

    private var forms: [VerbForm] { tab == .verbs ? content.verbForms : content.adjectiveForms }

    var body: some View {
        List {
            Section {
                Picker("Type", selection: $tab) {
                    Text("Verbs").tag(Tab.verbs)
                    Text("Adjectives").tag(Tab.adjectives)
                }
                .pickerStyle(.segmented)
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets())
            }

            if tab == .verbs { verbTypesSection }

            Section(tab == .verbs ? "Forms · ru 食べる · u 書く · する / くる" : "Forms · い 高い · な 静か") {
                ForEach(forms) { form in
                    NavigationLink {
                        FormDetailView(form: form, examples: Self.examples[tab] ?? [])
                    } label: {
                        FormRow(form: form, examples: Self.examples[tab] ?? [])
                    }
                }
            }
        }
        .navigationTitle("Conjugation")
    }

    private var verbTypesSection: some View {
        Section {
            DisclosureGroup("Ru-verbs vs U-verbs (ichidan / godan)") {
                VStack(alignment: .leading, spacing: 10) {
                    Text(RichText.inline("<strong>Ru-verbs</strong> (一段 ichidan — \"one row\"): the kana before る is always an <strong>e-sound</strong> or <strong>i-sound</strong>. Conjugations only ever use that one row of the hiragana chart. 食べる · 見る · 起きる · 教える"))
                    Text(RichText.inline("<strong>U-verbs</strong> (五段 godan — \"five rows\"): conjugations change the final kana across all five vowel rows (a / i / u / e / o). Any verb <em>not</em> ending in る is a U-verb; verbs ending in る where the preceding sound is <strong>a / u / o</strong> are also U-verbs. 書く → か・き・く・け・こ"))
                }
                .font(.callout)
                .padding(.vertical, 4)
                let exceptions = Self.uVerbExceptions
                Text("Exceptions — end in える or いる but are U-verbs (\(exceptions.count))")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(.secondary)
                ForEach(exceptions) { verb in
                    HStack {
                        Text(verb.kanji).font(.body.weight(.medium))
                        Text(verb.reading).foregroundStyle(.secondary)
                        Spacer()
                        Text(verb.meaning).font(.caption).foregroundStyle(.secondary)
                    }
                }
            }
        }
    }

    private static var uVerbExceptions: [Word] {
        let eSounds = "えけせてねへめれげぜでべぺ", iSounds = "いきしちにひみりぎじびぴ"
        return Library.shared.verbs.filter { verb in
            guard verb.type == .u, verb.reading.hasSuffix("る"), verb.reading.count >= 2 else { return false }
            let before = verb.reading[verb.reading.index(verb.reading.endIndex, offsetBy: -2)]
            return eSounds.contains(before) || iSounds.contains(before)
        }
    }
}

private struct FormRow: View {
    let form: VerbForm
    let examples: [Word]

    private var exampleText: String {
        let conjugator = Library.shared.conjugator
        let results = examples.map { conjugator.conjugate($0, form.key) }
        if examples.count == 4 { return "\(results[0]) · \(results[1]) · \(results[2]) / \(results[3])" }
        return results.joined(separator: " · ")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                FormPill(form: form, showName: false).font(.caption)
                Text(form.info.name).font(.headline)
                Spacer()
                Text("Ch \(form.info.chapter)").font(.caption).foregroundStyle(.secondary)
            }
            Text(exampleText).font(.subheadline).foregroundStyle(.secondary)
        }
        .padding(.vertical, 2)
    }
}

struct FormDetailView: View {
    let form: VerbForm
    let examples: [Word]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                HStack {
                    FormPill(form: form)
                    Text(form.info.nameJp).font(.headline).foregroundStyle(.secondary)
                    Spacer()
                    Tag(text: "Chapter \(form.info.chapter)")
                }
                Text(form.info.hint).font(.title3.weight(.semibold))

                Grid(alignment: .leading, horizontalSpacing: 16, verticalSpacing: 8) {
                    ForEach(examples) { word in
                        GridRow {
                            Text(word.kanji).foregroundStyle(.secondary)
                            Image(systemName: "arrow.right").foregroundStyle(.tertiary)
                            Text(Library.shared.conjugator.conjugate(word, form.key))
                                .font(.title3.weight(.semibold))
                                .foregroundStyle(form.color)
                        }
                    }
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(.fill.quaternary, in: .rect(cornerRadius: 14))

                if let explanation = form.info.explanation {
                    RichTextView(html: explanation)
                }
            }
            .padding()
        }
        .navigationTitle(form.info.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}
