import XCTest

/// Opens every exercise and reference screen, checking each loads. Screenshots are attached to the
/// test result and, when `TOKIDOKI_SHOTS_DIR` is set, also written to that directory.
@MainActor
final class ScreenTourTests: XCTestCase {
    private let app = XCUIApplication()
    private var shotIndex = 0

    func testTourAllScreens() {
        continueAfterFailure = true
        app.launch()
        XCTAssertTrue(app.navigationBars["Tokidoki"].waitForExistence(timeout: 10))
        shot("home")

        openRow("Verbs"); shot("verbs-chapters")
        openRow("Ch 3"); shot("verbs-question")
        tapButton("Show Answer"); shot("verbs-answer")
        tapButton("Easy"); shot("verbs-next")
        back(2)

        openRow("Adjectives"); shot("adjectives-chapters")
        openRow("Ch 5"); shot("adjectives-question")
        tapButton("Show Answer"); shot("adjectives-answer")
        back(2)

        openRow("Build Your Own"); shot("custom-builder")
        back()

        openRow("Sentences"); shot("sentences-chapters")
        openRow("Ch "); shot("sentences-question")
        tapButton("Show Answer"); shot("sentences-answer")
        back(2)

        openRow("Particles"); shot("particles-setup")
        tapButton("Start"); shot("particles-question")
        back(2)

        openRow("Kana"); shot("kana-setup")
        tapButton("Start drawing"); shot("kana-question")
        tapButton("Show Answer"); shot("kana-answer")
        back(2)

        openRow("Kanji Quiz"); shot("kanji-quiz-setup")
        tapButton("Start"); shot("kanji-flashcard")
        tapButton("Show Answer"); shot("kanji-flashcard-answer")
        back()
        app.buttons["Look-alikes"].firstMatch.tap()
        tapButton("Start"); shot("similar-kanji-question")
        back(2)

        app.tabBars.buttons["Reference"].tap(); shot("reference")
        for row in ["Conjugation", "Kanji", "Vocabulary", "Words by Kanji", "Look-alike Kanji"] {
            openRow(row); shot("reference-" + row.lowercased().replacingOccurrences(of: " ", with: "-"))
            back()
        }

        app.tabBars.buttons["Sheets"].tap(); shot("sheets")
        openRow("N5"); shot("sheets-expanded")
        openRow("Practice"); sleep(1); shot("sheet-pdf")
        back()

        app.tabBars.buttons["Settings"].tap(); shot("settings")
    }

    private func openRow(_ title: String) {
        let row = app.collectionViews.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", title)).firstMatch
        XCTAssertTrue(row.waitForExistence(timeout: 5), "Missing row \(title)")
        row.tap()
    }

    private func tapButton(_ title: String) {
        let button = app.buttons.matching(NSPredicate(format: "label == %@", title)).firstMatch
        XCTAssertTrue(button.waitForExistence(timeout: 5), "Missing button \(title)")
        button.tap()
    }

    private func back(_ times: Int = 1) {
        for _ in 0..<times {
            let button = app.navigationBars.firstMatch.buttons.element(boundBy: 0)
            if button.waitForExistence(timeout: 3) { button.tap() }
        }
    }

    private func shot(_ name: String) {
        sleep(1)
        shotIndex += 1
        let screenshot = XCUIScreen.main.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
        if let dir = ProcessInfo.processInfo.environment["TOKIDOKI_SHOTS_DIR"] {
            let url = URL(fileURLWithPath: dir).appendingPathComponent(String(format: "%02d-%@.png", shotIndex, name))
            try? screenshot.pngRepresentation.write(to: url)
        }
    }
}
