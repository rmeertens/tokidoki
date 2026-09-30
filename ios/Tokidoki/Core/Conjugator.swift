import Foundation
import JavaScriptCore

/// Thin wrapper around the website's `Conjugator` object in `conjugator.js`.
final class Conjugator {
    private let context: JSContext
    private let conjugator: JSValue
    private let verbForms: [VerbForm]
    private let adjectiveForms: [VerbForm]
    private var cache: [String: String] = [:]

    init(runtime: JSRuntime, verbForms: [VerbForm], adjectiveForms: [VerbForm]) throws {
        context = runtime.context
        conjugator = try runtime.evaluate("Conjugator")
        self.verbForms = verbForms
        self.adjectiveForms = adjectiveForms
    }

    /// The hiragana conjugation.
    func conjugate(_ word: Word, _ form: String) -> String {
        call(word.type.isAdjective ? "conjugateAdjective" : "conjugate", word, form) ?? word.reading
    }

    /// The same conjugation written with the word's kanji, if it has any.
    func conjugateKanji(_ word: Word, _ form: String) -> String? {
        call("conjugateKanji", word, form)
    }

    /// Every accepted answer: hiragana first, then the kanji spelling.
    func answers(_ word: Word, _ form: String) -> [String] {
        let hiragana = conjugate(word, form)
        if let kanji = conjugateKanji(word, form), kanji != hiragana { return [hiragana, kanji] }
        return [hiragana]
    }

    /// Forms unlocked by a chapter (every form introduced in it or earlier).
    func forms(forChapter chapter: Int, adjectives: Bool) -> [VerbForm] {
        (adjectives ? adjectiveForms : verbForms).filter { $0.info.chapter <= chapter }
    }

    private func call(_ method: String, _ word: Word, _ form: String) -> String? {
        let key = "\(method)|\(word.kanji)|\(word.reading)|\(word.type.rawValue)|\(form)"
        if let cached = cache[key] { return cached }
        guard let result = conjugator.invokeMethod(method, withArguments: [word.jsObject, form]),
              result.isString, let string = result.toString() else { return nil }
        cache[key] = string
        return string
    }
}
