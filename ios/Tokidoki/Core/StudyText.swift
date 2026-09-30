import Foundation

/// Hints and explanations for conjugation cards — a port of the matching helpers
/// in the website's `app.js`. Strings use the same small HTML
/// subset (`<strong>`, `<span class="ex-hl">`) and are rendered by `RichText`.
enum StudyText {
    static let negativeForms: Set<String> = ["masu-neg", "masu-past-neg", "nai", "nakatta", "adj-neg", "adj-past-neg"]

    private static let iRow: [Character: String] = ["う": "い", "つ": "ち", "る": "り", "む": "み", "ぶ": "び", "ぬ": "に", "く": "き", "ぐ": "ぎ", "す": "し"]
    private static let aRow: [Character: String] = ["う": "わ", "つ": "た", "る": "ら", "む": "ま", "ぶ": "ば", "ぬ": "な", "く": "か", "ぐ": "が", "す": "さ"]
    private static let eRow: [Character: String] = ["う": "え", "つ": "て", "る": "れ", "む": "め", "ぶ": "べ", "ぬ": "ね", "く": "け", "ぐ": "げ", "す": "せ"]
    private static let oRow: [Character: String] = ["う": "お", "つ": "と", "る": "ろ", "む": "も", "ぶ": "ぼ", "ぬ": "の", "く": "こ", "ぐ": "ご", "す": "そ"]
    private static let teRules: [Character: (te: String, ta: String)] = [
        "う": ("って", "った"), "つ": ("って", "った"), "る": ("って", "った"),
        "む": ("んで", "んだ"), "ぶ": ("んで", "んだ"), "ぬ": ("んで", "んだ"),
        "く": ("いて", "いた"), "ぐ": ("いで", "いだ"), "す": ("して", "した"),
    ]
    private static let iRowForms: Set<String> = ["masu", "masu-neg", "masu-past", "masu-past-neg", "tai"]
    private static let aRowForms: Set<String> = ["nai", "nakatta", "passive", "causative", "causative-passive"]
    private static let eRowForms: Set<String> = ["potential", "ba"]

    // MARK: - Card front

    static func hintSteps(word: Word, form: VerbForm) -> [String] {
        var steps = ["The word is <strong>\(word.kanji)</strong> (\(word.reading)) — \(word.meaning)"]
        let key = form.key

        if word.type.isAdjective {
            steps.append("This is a <strong>\(word.type.label)</strong>")
            if word.type == .iAdjective {
                if word.reading == "いい" || word.reading == "かっこいい" {
                    steps.append("\(word.reading) is <strong>irregular</strong> — it uses a different stem")
                }
                steps.append(key != "adj-present"
                    ? "For い-adjectives: drop the final い, then add the \(form.info.name) suffix"
                    : "The present form is the dictionary form — no change needed")
            } else {
                steps.append(key == "adj-present"
                    ? "For な-adjectives: add <strong>だ</strong> for the plain present"
                    : "For な-adjectives: add the appropriate suffix directly to the stem")
            }
        } else {
            steps.append("This is a <strong>\(word.type.label)</strong>")
            switch word.type {
            case .ru:
                steps.append("Ru-verbs: drop <strong>る</strong> from the end, then add the suffix")
            case .u:
                steps.append("The dictionary form ends in <strong>\(word.reading.suffix(1))</strong>")
                if iRowForms.contains(key) {
                    steps.append("For this form: change the ending to the <strong>い-row</strong> (い-column), then add the suffix")
                } else if key == "te" || key == "ta" {
                    steps.append("For て/た-form: the rule depends on the final kana — think about the sound change group")
                } else if aRowForms.contains(key) {
                    steps.append("For this form: change the ending to the <strong>あ-row</strong>, then add the suffix")
                } else if eRowForms.contains(key) {
                    steps.append("For this form: change the ending to the <strong>え-row</strong>, then add the suffix")
                } else if key == "volitional" {
                    steps.append("For this form: change the ending to the <strong>お-row</strong>, then add う")
                } else if key == "dict" {
                    steps.append("The dictionary form is the word as-is — no change needed")
                }
            default:
                if word.reading.hasSuffix("する") { steps.append("する verbs have their own conjugation pattern") }
                else if word.reading.hasSuffix("くる") { steps.append("くる has its own irregular conjugation pattern") }
                else { steps.append("Think about which irregular pattern this verb follows") }
            }
        }

        steps.append("Target form: <strong>\(form.info.name)</strong> (\(form.info.symbol)) — \(form.info.hint)")
        return steps
    }

    // MARK: - Card back

    struct Explanation {
        let rule: String
        let steps: String
    }

    static func explanation(word: Word, form: String) -> Explanation? {
        switch word.type {
        case .iAdjective, .naAdjective: adjectiveExplanation(word, form)
        case .irregular: irregularExplanation(word, form)
        case .ru: ruExplanation(word, form)
        case .u: uExplanation(word, form)
        }
    }

    private static func hl(_ text: String) -> String { "<span class=\"ex-hl\">\(text)</span>" }
    private static func result(_ base: String, _ highlighted: String) -> String { "→ \(base)\(hl(highlighted))" }

    private static func ruExplanation(_ word: Word, _ form: String) -> Explanation? {
        let suffixes = [
            "masu": "ます", "masu-neg": "ません", "masu-past": "ました", "masu-past-neg": "ませんでした",
            "te": "て", "ta": "た", "nai": "ない", "nakatta": "なかった", "tai": "たい",
            "potential": "られる", "volitional": "よう", "passive": "られる",
            "causative": "させる", "causative-passive": "させられる", "ba": "れば",
        ]
        if form == "dict" {
            return Explanation(rule: "<strong>Ru-verb:</strong> dictionary form is the plain form", steps: "→ \(word.reading) (no change)")
        }
        guard let suffix = suffixes[form] else { return nil }
        return Explanation(
            rule: "<strong>Ru-verb:</strong> drop \(hl("る")) from \(word.reading)",
            steps: result(String(word.reading.dropLast()), suffix)
        )
    }

    private static func uExplanation(_ word: Word, _ form: String) -> Explanation? {
        let reading = word.reading
        guard let ending = reading.last else { return nil }
        let base = String(reading.dropLast())
        let isIku = reading.hasSuffix("いく") || reading.hasSuffix("ゆく")

        func rowChange(_ row: [Character: String], _ rowName: String, _ suffix: String) -> Explanation? {
            guard let kana = row[ending] else { return nil }
            return Explanation(
                rule: "<strong>U-verb:</strong> change \(hl(String(ending))) to \(hl(kana)) (\(rowName))",
                steps: result(base, kana + suffix)
            )
        }

        switch form {
        case "masu": return rowChange(iRow, "い-row", "ます")
        case "masu-neg": return rowChange(iRow, "い-row", "ません")
        case "masu-past": return rowChange(iRow, "い-row", "ました")
        case "masu-past-neg": return rowChange(iRow, "い-row", "ませんでした")
        case "tai": return rowChange(iRow, "い-row", "たい")
        case "te", "ta":
            if isIku {
                return Explanation(
                    rule: "<strong>U-verb (いく):</strong> special rule — いく uses \(hl("いって/いった"))",
                    steps: result(String(reading.dropLast(2)), form == "te" ? "いって" : "いった")
                )
            }
            guard let rule = teRules[ending] else { return nil }
            let change = form == "te" ? rule.te : rule.ta
            return Explanation(
                rule: "<strong>U-verb:</strong> \(form == "te" ? "て" : "た")-form rule for \(hl(String(ending))): \(hl(String(ending))) → \(rule.te)",
                steps: result(base, change)
            )
        case "nai": return rowChange(aRow, "あ-row", "ない")
        case "nakatta": return rowChange(aRow, "あ-row", "なかった")
        case "dict":
            return Explanation(rule: "<strong>U-verb:</strong> dictionary form is the plain form", steps: "→ \(reading) (no change)")
        case "potential": return rowChange(eRow, "え-row", "る")
        case "volitional": return rowChange(oRow, "お-row", "う")
        case "passive": return rowChange(aRow, "あ-row", "れる")
        case "causative": return rowChange(aRow, "あ-row", "せる")
        case "causative-passive": return rowChange(aRow, "あ-row", "せられる")
        case "ba": return rowChange(eRow, "え-row", "ば")
        default: return nil
        }
    }

    private static func irregularExplanation(_ word: Word, _ form: String) -> Explanation? {
        let reading = word.reading
        let prefix = String(reading.dropLast(2))

        if reading.hasSuffix("する") {
            let rule = "<strong>Irregular (する):</strong> する has unique conjugation stems"
            if form == "dict" { return Explanation(rule: rule, steps: "→ \(reading) (no change)") }
            let stems = ["potential": "でき", "passive": "さ", "causative": "さ", "causative-passive": "さ", "ba": "す"]
            let suffixes = [
                "masu": "ます", "masu-neg": "ません", "masu-past": "ました", "masu-past-neg": "ませんでした",
                "te": "て", "ta": "た", "nai": "ない", "nakatta": "なかった", "tai": "たい", "potential": "る",
                "volitional": "よう", "passive": "れる", "causative": "せる", "causative-passive": "せられる", "ba": "れば",
            ]
            return Explanation(rule: rule, steps: result(prefix, (stems[form] ?? "し") + (suffixes[form] ?? "")))
        }

        if reading.hasSuffix("くる") {
            let rule = "<strong>Irregular (くる):</strong> くる changes its vowel"
            if form == "dict" { return Explanation(rule: rule, steps: "→ \(reading) (no change)") }
            let stems = [
                "nai": "こ", "nakatta": "こ", "potential": "こられ", "volitional": "こ", "passive": "こられ",
                "causative": "こさせ", "causative-passive": "こさせられ", "ba": "く",
            ]
            let suffixes = [
                "masu": "ます", "masu-neg": "ません", "masu-past": "ました", "masu-past-neg": "ませんでした",
                "te": "て", "ta": "た", "tai": "たい", "nai": "ない", "nakatta": "なかった", "potential": "る",
                "volitional": "よう", "passive": "る", "causative": "る", "causative-passive": "る", "ba": "れば",
            ]
            return Explanation(rule: rule, steps: result(prefix, (stems[form] ?? "き") + (suffixes[form] ?? "")))
        }
        return nil
    }

    private static func adjectiveExplanation(_ word: Word, _ form: String) -> Explanation? {
        let reading = word.reading
        let iSuffixes = ["adj-neg": "くない", "adj-past": "かった", "adj-past-neg": "くなかった", "adj-te": "くて", "adj-adverb": "く"]

        if word.type == .iAdjective {
            if reading == "いい" || reading == "かっこいい" {
                let stem = reading == "いい" ? "よ" : "かっこよ"
                let rule = "<strong>い-adjective (irregular):</strong> \(reading) uses \(stem)- stem for conjugations"
                if form == "adj-present" { return Explanation(rule: rule, steps: "→ \(reading) (no change)") }
                return Explanation(rule: rule, steps: result(stem, iSuffixes[form] ?? ""))
            }
            if form == "adj-present" {
                return Explanation(rule: "<strong>い-adjective:</strong> dictionary form", steps: "→ \(reading) (no change)")
            }
            return Explanation(
                rule: "<strong>い-adjective:</strong> drop \(hl("い")) from \(reading)",
                steps: result(String(reading.dropLast()), iSuffixes[form] ?? "")
            )
        }

        let naSuffixes = ["adj-present": "だ", "adj-neg": "じゃない", "adj-past": "だった", "adj-past-neg": "じゃなかった", "adj-te": "で", "adj-adverb": "に"]
        return Explanation(rule: "<strong>な-adjective:</strong> add suffix to \(reading)", steps: result(reading, naSuffixes[form] ?? ""))
    }

    // MARK: - Answer coloring

    /// The answer split into unchanged stem, the kana that changed, and the new ending.
    struct AnswerParts {
        let stem: String
        let changed: String
        let ending: String
    }

    static func answerParts(word: Word, form: String, answer: String) -> AnswerParts {
        guard let stem = displayStem(word, form), answer.hasPrefix(stem), stem.count < answer.count else {
            return AnswerParts(stem: "", changed: "", ending: answer)
        }
        let ending = String(answer.dropFirst(stem.count))
        if word.type == .u, form != "dict" {
            let unchanged = String(word.reading.dropLast())
            if stem.hasPrefix(unchanged), unchanged.count < stem.count {
                return AnswerParts(stem: unchanged, changed: String(stem.dropFirst(unchanged.count)), ending: ending)
            }
        }
        return AnswerParts(stem: stem, changed: "", ending: ending)
    }

    private static func displayStem(_ word: Word, _ form: String) -> String? {
        let reading = word.reading
        switch word.type {
        case .iAdjective:
            if form == "adj-present" { return nil }
            if reading == "いい" { return "よ" }
            if reading == "かっこいい" { return "かっこよ" }
            return String(reading.dropLast())
        case .naAdjective:
            return reading
        case .ru:
            return form == "dict" ? nil : String(reading.dropLast())
        case .u:
            guard form != "dict", let ending = reading.last else { return nil }
            let base = String(reading.dropLast())
            if iRowForms.contains(form) { return iRow[ending].map { base + $0 } }
            if aRowForms.contains(form) { return aRow[ending].map { base + $0 } }
            if eRowForms.contains(form) { return eRow[ending].map { base + $0 } }
            if form == "volitional" { return oRow[ending].map { base + $0 } }
            if form == "te" || form == "ta" {
                if reading.hasSuffix("いく") || reading.hasSuffix("ゆく") { return String(reading.dropLast(2)) + "い" }
                guard let rule = teRules[ending] else { return nil }
                return base + String((form == "te" ? rule.te : rule.ta).dropLast())
            }
            return nil
        case .irregular:
            if form == "dict" { return nil }
            if reading.hasSuffix("する") || reading.hasSuffix("くる") || reading == "きる" { return String(reading.dropLast(2)) }
            return nil
        }
    }

    // MARK: - Answer checking

    static func normalize(_ text: String) -> String {
        text.filter { !$0.isWhitespace }.precomposedStringWithCompatibilityMapping
    }
}
