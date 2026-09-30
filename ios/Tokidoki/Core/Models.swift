import Foundation

enum WordType: String, Codable, Hashable {
    case u, ru, irregular
    case iAdjective = "i-adj"
    case naAdjective = "na-adj"

    var isAdjective: Bool { self == .iAdjective || self == .naAdjective }

    var label: String {
        switch self {
        case .u: "U-verb (五段)"
        case .ru: "Ru-verb (一段)"
        case .irregular: "Irregular verb"
        case .iAdjective: "い-adjective"
        case .naAdjective: "な-adjective"
        }
    }
}

/// A verb or adjective from `verbs.js`.
struct Word: Codable, Hashable, Identifiable {
    let kanji: String
    let reading: String
    let meaning: String
    let type: WordType
    let chapter: Int
    let disambig: String?

    /// Same key the website uses for Build Your Own selections.
    var id: String {
        if type.isAdjective { return "adj:\(reading)" }
        return disambig.map { "\(reading)_\($0)" } ?? reading
    }

    /// SRS card id — identical to the website's `cardId` / `adjCardId` so progress keys match.
    func cardID(form: String) -> String {
        if type.isAdjective { return "adj:\(reading):\(form)" }
        let base = disambig.map { "\(reading)_\($0)" } ?? reading
        return "\(chapter)_\(base)_\(form)"
    }

    /// The word as the plain object the site's JS functions expect.
    var jsObject: [String: Any] {
        var object: [String: Any] = [
            "kanji": kanji, "reading": reading, "meaning": meaning, "type": type.rawValue, "chapter": chapter,
        ]
        if let disambig { object["disambig"] = disambig }
        return object
    }
}

struct ChapterInfo: Codable, Hashable {
    let title: String
    let book: String
    let newForms: [String]?
}

struct Chapter: Identifiable, Hashable {
    let number: Int
    let info: ChapterInfo
    var id: Int { number }
}

struct FormInfo: Codable, Hashable {
    let name: String
    let nameJp: String
    let hint: String
    let symbol: String
    let color: String
    let chapter: Int
    let explanation: String?
}

struct VerbForm: Identifiable, Hashable {
    let key: String
    let info: FormInfo
    var id: String { key }
}

struct KanaEntry: Codable, Hashable {
    let kana: String
    let romaji: String
}

struct KanjiEntry: Codable, Hashable {
    let kanji: String
    let meaning: String
}

struct Sentence: Codable, Hashable {
    let ja: String
    let jaHtml: String?
    let en: String
}

struct VocabWord: Codable, Hashable {
    let kanji: String
    let kana: String
    let html: String
    let meaning: String
}

struct KanjiInfo: Codable, Hashable {
    let meaning: String?
    let on: String?
    let kun: String?

    var readings: String {
        [on.map { "on: \($0)" }, kun.map { "kun: \($0)" }]
            .compactMap { $0 }
            .filter { !$0.hasSuffix(": ") }
            .joined(separator: "   ")
    }
}

struct ParticleItem: Codable, Hashable, Identifiable {
    let id: String
    let particle: String
    let en: String
    let beforeHtml: String
    let afterHtml: String
    let beforePlain: String
    let afterPlain: String
}

struct ConfusableGroup: Codable, Hashable {
    let kanji: [String]
    let meanings: [String: String]
    let levels: [String: String]
}

enum JLPTLevel: String, CaseIterable, Identifiable, Codable {
    case n5, n4, n3, n2, n1
    var id: String { rawValue }
    var label: String { rawValue.uppercased() }
    static let vocabulary: [JLPTLevel] = [.n5, .n4, .n3]
}
