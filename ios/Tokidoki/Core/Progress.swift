import Foundation
import Observation
import SwiftUI

/// SM-2-style scheduling state — same fields and formula as the website's SRS engine.
struct CardState: Codable, Equatable {
    var easeFactor = 2.5
    var interval = 0
    var repetitions = 0
    /// Milliseconds since 1970, like `Date.now()` on the website.
    var nextReview: Double = 0

    var isDue: Bool { Date.now.timeIntervalSince1970 * 1000 >= nextReview }

    func graded(_ grade: Grade) -> CardState {
        let now = Date.now.timeIntervalSince1970 * 1000
        var next = self
        if grade == .again {
            next.repetitions = 0
            next.interval = 0
            next.nextReview = now
            return next
        }
        let g = Double(grade.rawValue)
        switch next.repetitions {
        case 0: next.interval = 1
        case 1: next.interval = 3
        default:
            let multiplier = grade.rawValue == 3 ? next.easeFactor : next.easeFactor * 1.3
            next.interval = Int((Double(next.interval) * multiplier).rounded())
        }
        next.repetitions += 1
        next.easeFactor = max(1.3, next.easeFactor + (0.1 - (4 - g) * (0.08 + (4 - g) * 0.02)))
        next.nextReview = now + Double(next.interval) * 86_400_000
        return next
    }
}

/// The website only offers two buttons: "Again" (1) and "Easy / Got it" (4).
enum Grade: Int {
    case again = 1
    case easy = 4
}

struct Stats: Codable, Equatable {
    var totalReviews = 0
    var totalCorrect = 0
    var streak = 0
    var lastStudyDate: String?
    var todayReviews = 0
    var todayCorrect = 0
}

/// Everything the user has studied: per-card SRS state plus daily stats and streak.
@Observable
final class ProgressStore {
    static let shared = ProgressStore()

    private(set) var cards: [String: CardState]
    private(set) var stats: Stats

    private let cardsURL: URL
    private let statsURL: URL

    private init() {
        let directory = URL.applicationSupportDirectory.appendingPathComponent("Tokidoki", isDirectory: true)
        try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        cardsURL = directory.appendingPathComponent("srs.json")
        statsURL = directory.appendingPathComponent("stats.json")
        cards = (try? JSONDecoder().decode([String: CardState].self, from: Data(contentsOf: cardsURL))) ?? [:]
        stats = (try? JSONDecoder().decode(Stats.self, from: Data(contentsOf: statsURL))) ?? Stats()
    }

    func state(_ id: String) -> CardState { cards[id] ?? CardState() }
    func isDue(_ id: String) -> Bool { state(id).isDue }
    func dueCount<S: Sequence>(_ ids: S) -> Int where S.Element == String { ids.reduce(0) { $0 + (isDue($1) ? 1 : 0) } }

    var todayReviews: Int { stats.lastStudyDate == Self.today ? stats.todayReviews : 0 }
    var todayCorrect: Int { stats.lastStudyDate == Self.today ? stats.todayCorrect : 0 }
    var todayAccuracy: Int { todayReviews > 0 ? Int((Double(todayCorrect) / Double(todayReviews) * 100).rounded()) : 0 }
    /// A streak only counts while it's still alive (studied today or yesterday).
    var currentStreak: Int { [Self.today, Self.yesterday].contains(stats.lastStudyDate) ? stats.streak : 0 }

    struct Snapshot {
        let cardID: String
        let card: CardState?
        let stats: Stats
    }

    /// Grades a card and returns what's needed to undo it.
    @discardableResult
    func grade(_ id: String, _ grade: Grade, correct: Bool) -> Snapshot {
        let snapshot = Snapshot(cardID: id, card: cards[id], stats: stats)
        cards[id] = state(id).graded(grade)

        let today = Self.today
        if stats.lastStudyDate != today {
            stats.streak = stats.lastStudyDate == Self.yesterday ? stats.streak + 1 : 1
            stats.todayReviews = 0
            stats.todayCorrect = 0
            stats.lastStudyDate = today
        }
        stats.totalReviews += 1
        stats.todayReviews += 1
        if correct {
            stats.totalCorrect += 1
            stats.todayCorrect += 1
        }
        save()
        return snapshot
    }

    func restore(_ snapshot: Snapshot) {
        cards[snapshot.cardID] = snapshot.card
        stats = snapshot.stats
        save()
    }

    func resetAll() {
        cards = [:]
        stats = Stats()
        save()
    }

    private func save() {
        let encoder = JSONEncoder()
        try? encoder.encode(cards).write(to: cardsURL, options: .atomic)
        try? encoder.encode(stats).write(to: statsURL, options: .atomic)
    }

    private static func dayString(_ date: Date) -> String {
        let components = Calendar.current.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", components.year ?? 0, components.month ?? 0, components.day ?? 0)
    }

    static var today: String { dayString(.now) }
    static var yesterday: String { dayString(Calendar.current.date(byAdding: .day, value: -1, to: .now) ?? .now) }
}

protocol StudyCard: Identifiable where ID == String {}

/// One study session: a queue of cards, a running score and an undo stack.
@Observable
final class StudySession<Card: StudyCard> {
    private(set) var cards: [Card]
    private(set) var index = 0
    private(set) var total: Int
    private(set) var correct = 0
    private var undoStack: [(snapshot: ProgressStore.Snapshot, index: Int, correct: Int, total: Int, requeued: Bool)] = []

    /// Cards graded "Again" come back at the end of the session.
    let requeuesMisses: Bool

    init(cards: [Card], requeuesMisses: Bool = false) {
        self.cards = cards
        self.total = cards.count
        self.requeuesMisses = requeuesMisses
    }

    var current: Card? { index < cards.count ? cards[index] : nil }
    var isFinished: Bool { index >= cards.count }
    var canUndo: Bool { !undoStack.isEmpty }
    var progress: Double { total > 0 ? Double(index) / Double(total) : 0 }
    var accuracy: Int { index > 0 ? Int((Double(correct) / Double(index) * 100).rounded()) : 0 }

    func grade(_ grade: Grade, correct isCorrect: Bool) {
        guard let card = current else { return }
        let snapshot = ProgressStore.shared.grade(card.id, grade, correct: isCorrect)
        let requeue = requeuesMisses && grade == .again
        undoStack.append((snapshot, index, correct, total, requeue))
        if isCorrect { correct += 1 }
        if requeue {
            cards.append(card)
            total += 1
        }
        index += 1
    }

    func undo() {
        guard let entry = undoStack.popLast() else { return }
        ProgressStore.shared.restore(entry.snapshot)
        if entry.requeued { cards.removeLast() }
        index = entry.index
        correct = entry.correct
        total = entry.total
    }

    /// Due cards first (or everything, when nothing is due), hardest first, capped at `limit`.
    static func pick(from pool: [Card], limit: Int = 20) -> [Card] {
        let progress = ProgressStore.shared
        let due = pool.filter { progress.isDue($0.id) }
        var failed: [Card] = [], struggling: [Card] = [], normal: [Card] = []
        for card in due.isEmpty ? pool : due {
            let state = progress.state(card.id)
            if progress.cards[card.id] != nil, state.repetitions == 0, state.interval == 0 { failed.append(card) }
            else if state.easeFactor < 2.0 { struggling.append(card) }
            else { normal.append(card) }
        }
        return Array((failed.shuffled() + struggling.shuffled() + normal.shuffled()).prefix(limit))
    }
}

/// The website's study settings, persisted in UserDefaults.
@Observable
final class AppSettings {
    static let shared = AppSettings()

    var typingMode: Bool { didSet { save() } }
    var hideForm: Bool { didSet { save() } }
    var showContext: Bool { didSet { save() } }
    var englishToJapanese: Bool { didSet { save() } }
    var showExampleFront: Bool { didSet { save() } }
    var showFurigana: Bool { didSet { save() } }
    var appearance: Appearance { didSet { save() } }

    enum Appearance: String, Codable, CaseIterable, Identifiable {
        case light, dark, system

        var id: Self { self }

        var label: String {
            switch self {
            case .light: "Light"
            case .dark: "Dark"
            case .system: "System"
            }
        }

        var colorScheme: ColorScheme? {
            switch self {
            case .light: .light
            case .dark: .dark
            case .system: nil
            }
        }
    }

    private static let key = "tokidoki_settings"

    private struct Stored: Codable {
        var typingMode = false
        var hideForm = true
        var showContext = true
        var englishToJapanese = true
        var showExampleFront = false
        var showFurigana = true
        // Optional so settings saved before this key existed still decode.
        var appearance: Appearance?
    }

    private init() {
        let stored = UserDefaults.standard.data(forKey: Self.key)
            .flatMap { try? JSONDecoder().decode(Stored.self, from: $0) } ?? Stored()
        typingMode = stored.typingMode
        hideForm = stored.hideForm
        showContext = stored.showContext
        englishToJapanese = stored.englishToJapanese
        showExampleFront = stored.showExampleFront
        showFurigana = stored.showFurigana
        appearance = stored.appearance ?? .light
    }

    private func save() {
        let stored = Stored(
            typingMode: typingMode, hideForm: hideForm, showContext: showContext,
            englishToJapanese: englishToJapanese, showExampleFront: showExampleFront, showFurigana: showFurigana,
            appearance: appearance
        )
        UserDefaults.standard.set(try? JSONEncoder().encode(stored), forKey: Self.key)
    }
}
