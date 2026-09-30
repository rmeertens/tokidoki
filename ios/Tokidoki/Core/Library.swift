import Foundation
import JavaScriptCore

/// All exercise content, read from the website's own JS files (copied into the
/// bundle's `Content/` folder at build time) by evaluating them in JavaScriptCore.
/// The conjugation rules also stay in `conjugator.js`, so the app and the site
/// can never disagree.
final class Library {
    static let shared: Library = {
        do { return try Library() } catch { fatalError("Bundled Tokidoki content failed to load: \(error)") }
    }()

    let verbs: [Word]
    let adjectives: [Word]
    let verbChapters: [Chapter]
    let adjectiveChapters: [Chapter]
    let sentenceChapters: [Chapter]
    let sentences: [Int: [Sentence]]
    let verbForms: [VerbForm]
    let adjectiveForms: [VerbForm]
    let hiragana: [KanaEntry]
    let katakana: [KanaEntry]
    let kanji: [JLPTLevel: [KanjiEntry]]
    let vocabulary: [JLPTLevel: [VocabWord]]
    let kanjiInfo: [String: KanjiInfo]
    let particles: [String]
    let particleRomaji: [String: String]
    let particleDistractors: [String: [String]]
    let particleExplanations: [String: String]
    let particleItems: [ParticleItem]
    let confusableGroups: [ConfusableGroup]
    let conjugator: Conjugator
    let examples: ExampleSentences

    let contentRoot: URL

    private init() throws {
        guard let root = Bundle.main.resourceURL?.appendingPathComponent("Content", isDirectory: true) else {
            throw ContentError.missingBundle
        }
        contentRoot = root

        let js = try JSRuntime(root: root, files: [
            "conjugator.js", "verbs.js", "examples.js", "kana.js", "kanji-quiz-data.js", "sentences-data.js",
            "vocabulary-data.js", "kanji-info-data.js", "particles-data.js", "confusable-kanji-data.js",
        ])

        verbs = try js.decode("GENKI_VERBS")
        adjectives = try js.decode("GENKI_ADJECTIVES")

        let chapterInfo: [String: ChapterInfo] = try js.decode("CHAPTER_INFO")
        let adjChapterInfo: [String: ChapterInfo] = try js.decode("ADJ_CHAPTER_INFO")
        let extraChapterInfo: [String: ChapterInfo] = try js.decode("EXTRA_CHAPTER_INFO")
        verbChapters = Self.chapters(chapterInfo)
        adjectiveChapters = Self.chapters(adjChapterInfo)

        let rawSentences: [String: [Sentence]] = try js.decode("TRANSLATE_SENTENCES")
        sentences = Dictionary(uniqueKeysWithValues: rawSentences.compactMap { key, value in Int(key).map { ($0, value) } })
        let allInfo = chapterInfo.merging(extraChapterInfo) { current, _ in current }
        sentenceChapters = sentences.keys.sorted().compactMap { number in
            allInfo[String(number)].map { Chapter(number: number, info: $0) }
        }

        let formInfo: [String: FormInfo] = try js.decode("Conjugator.FORM_INFO")
        let adjFormInfo: [String: FormInfo] = try js.decode("Conjugator.ADJ_FORM_INFO")
        let allForms: [String] = try js.decode("Conjugator.ALL_FORMS")
        let adjAllForms: [String] = try js.decode("Conjugator.ADJ_ALL_FORMS")
        verbForms = allForms.compactMap { key in formInfo[key].map { VerbForm(key: key, info: $0) } }
        adjectiveForms = adjAllForms.compactMap { key in adjFormInfo[key].map { VerbForm(key: key, info: $0) } }

        let kana: [String: [KanaEntry]] = try js.decode("KANA_DATA")
        hiragana = kana["hiragana"] ?? []
        katakana = kana["katakana"] ?? []

        let rawKanji: [String: [KanjiEntry]] = try js.decode("KANJI_QUIZ_DATA")
        kanji = Self.byLevel(rawKanji)
        let rawVocab: [String: [VocabWord]] = try js.decode("VOCAB_DATA")
        vocabulary = Self.byLevel(rawVocab)
        kanjiInfo = try js.decode("KANJI_INFO")

        particles = try js.decode("PARTICLE_LIST")
        particleRomaji = try js.decode("PARTICLE_ROMAJI")
        particleDistractors = try js.decode("PARTICLE_DISTRACTOR_GROUPS")
        particleExplanations = try js.decode("PARTICLE_EXPLANATIONS")
        particleItems = try js.decode("PARTICLE_QUIZ_ITEMS")
        confusableGroups = try js.decode("CONFUSABLE_KANJI_GROUPS")

        conjugator = try Conjugator(runtime: js, verbForms: verbForms, adjectiveForms: adjectiveForms)
        examples = try ExampleSentences(runtime: js)
    }

    private static func chapters(_ info: [String: ChapterInfo]) -> [Chapter] {
        info.compactMap { key, value in Int(key).map { Chapter(number: $0, info: value) } }
            .sorted { $0.number < $1.number }
    }

    private static func byLevel<T>(_ raw: [String: [T]]) -> [JLPTLevel: [T]] {
        Dictionary(uniqueKeysWithValues: raw.compactMap { key, value in JLPTLevel(rawValue: key).map { ($0, value) } })
    }

    // MARK: - Lookups

    func words(inChapter chapter: Int, adjectives isAdjective: Bool) -> [Word] {
        (isAdjective ? adjectives : verbs).filter { $0.chapter == chapter }
    }

    func form(_ key: String) -> VerbForm? {
        verbForms.first { $0.key == key } ?? adjectiveForms.first { $0.key == key }
    }

    func kanjiEntry(for character: String) -> (level: JLPTLevel, entry: KanjiEntry)? {
        for level in JLPTLevel.allCases {
            if let entry = kanji[level]?.first(where: { $0.kanji == character }) { return (level, entry) }
        }
        return nil
    }

    /// Every vocabulary word that contains a given kanji, built once on first use.
    private(set) lazy var wordsByKanji: [String: [(level: JLPTLevel, word: VocabWord)]] = {
        var index: [String: [(level: JLPTLevel, word: VocabWord)]] = [:]
        for level in JLPTLevel.vocabulary {
            for word in vocabulary[level] ?? [] {
                var seen = Set<Character>()
                for character in word.kanji where character.isKanji && seen.insert(character).inserted {
                    index[String(character), default: []].append((level, word))
                }
            }
        }
        return index
    }()

    func pdfURL(_ relativePath: String) -> URL? {
        let url = contentRoot.appendingPathComponent(relativePath)
        return FileManager.default.fileExists(atPath: url.path) ? url : nil
    }
}

enum ContentError: Error, CustomStringConvertible {
    case missingBundle
    case missingFile(String)
    case script(String)

    var description: String {
        switch self {
        case .missingBundle: "The app bundle has no Content folder."
        case .missingFile(let name): "Missing bundled file \(name)."
        case .script(let message): "JavaScript error: \(message)"
        }
    }
}

/// A JavaScriptCore context with the site's data scripts loaded.
final class JSRuntime {
    let context: JSContext
    private var lastException: String?

    init(root: URL, files: [String]) throws {
        guard let context = JSContext() else { throw ContentError.script("Could not create a JSContext") }
        self.context = context
        context.exceptionHandler = { [weak self] _, exception in
            self?.lastException = exception?.toString() ?? "unknown error"
        }
        // The data files are browser scripts that finish with `})(window);`.
        context.evaluateScript("var window = globalThis;")

        for file in files {
            let url = root.appendingPathComponent(file)
            guard let source = try? String(contentsOf: url, encoding: .utf8) else { throw ContentError.missingFile(file) }
            context.evaluateScript(source, withSourceURL: url)
            try throwIfFailed("\(file)")
        }
    }

    func evaluate(_ script: String) throws -> JSValue {
        let value = context.evaluateScript(script)
        try throwIfFailed(script.prefix(80).description)
        guard let value else { throw ContentError.script("No result for \(script.prefix(80))") }
        return value
    }

    func decode<T: Decodable>(_ expression: String) throws -> T {
        let json = try evaluate("JSON.stringify(\(expression))")
        guard json.isString, let data = json.toString()?.data(using: .utf8) else {
            throw ContentError.script("\(expression) is undefined")
        }
        return try JSONDecoder().decode(T.self, from: data)
    }

    private func throwIfFailed(_ where: String) throws {
        if let message = lastException {
            lastException = nil
            throw ContentError.script("\(message) (in \(`where`))")
        }
    }
}

extension Character {
    /// CJK ideographs plus 々 — the same ranges the website's `VOCAB_KANJI_CHAR_RE` matches.
    var isKanji: Bool {
        guard let scalar = unicodeScalars.first else { return false }
        return (0x4E00...0x9FFF).contains(scalar.value)
            || (0x3400...0x4DBF).contains(scalar.value)
            || scalar.value == 0x3005
    }
}
