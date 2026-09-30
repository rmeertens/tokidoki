import Foundation
import JavaScriptCore

/// Thin wrapper around the website's `Examples` object in `examples.js`: example
/// sentences and English form hints for conjugation cards.
final class ExampleSentences {
    struct Example: Hashable {
        let ja: Furigana
        let en: String
    }

    private let examples: JSValue
    private var exampleCache: [String: Example?] = [:]
    private var hintCache: [String: String] = [:]

    init(runtime: JSRuntime) throws {
        examples = try runtime.evaluate("Examples")
    }

    /// A Japanese/English example using the conjugated form — pass `nil` to blank it out.
    /// Nil when the form has no natural sentence for this word.
    func example(_ word: Word, form: String, conjugated: String?) -> Example? {
        let key = "\(word.id)|\(form)|\(conjugated ?? "")"
        if let cached = exampleCache[key] { return cached }
        var example: Example?
        if let result = examples.invokeMethod("build", withArguments: [word.jsObject, form, conjugated ?? NSNull()]),
           result.isObject,
           let ja = result.forProperty("ja")?.toString(),
           let en = result.forProperty("en")?.toString(),
           let html = examples.invokeMethod("furiganaHtml", withArguments: [ja])?.toString() {
            example = Example(ja: Furigana(html: html), en: en)
        }
        exampleCache[key] = example
        return example
    }

    /// Short English gloss of the target form, e.g. "didn't eat (polite, past)".
    func hint(meaning: String, form: String) -> String {
        let key = "\(meaning)|\(form)"
        if let cached = hintCache[key] { return cached }
        let hint = examples.invokeMethod("hint", withArguments: [meaning, form])?.toString() ?? meaning
        hintCache[key] = hint
        return hint
    }
}
