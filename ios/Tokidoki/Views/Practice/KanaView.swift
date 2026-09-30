import PencilKit
import SwiftUI

struct KanaCard: @MainActor StudyCard, Hashable {
    let id: String
    let kana: String
    let romaji: String
    let isKatakana: Bool

    var scriptName: String { isKatakana ? "Katakana" : "Hiragana" }

    static func pool(hiragana: Bool, katakana: Bool) -> [KanaCard] {
        let content = Library.shared
        var cards: [KanaCard] = []
        if hiragana {
            cards += content.hiragana.map { KanaCard(id: "kana_hiragana_\($0.kana)", kana: $0.kana, romaji: $0.romaji, isKatakana: false) }
        }
        if katakana {
            cards += content.katakana.map { KanaCard(id: "kana_katakana_\($0.kana)", kana: $0.kana, romaji: $0.romaji, isKatakana: true) }
        }
        return cards
    }
}

struct KanaSetupView: View {
    @AppStorage("kana_hiragana") private var hiragana = true
    @AppStorage("kana_katakana") private var katakana = false
    private var progress: ProgressStore { .shared }

    private var pool: [KanaCard] { KanaCard.pool(hiragana: hiragana, katakana: katakana) }

    var body: some View {
        Form {
            Section {
                Text("See a romaji prompt, draw the matching character with your finger or Apple Pencil, then reveal the answer to check yourself.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }
            Section("Scripts") {
                Toggle("Hiragana  ひらがな", isOn: Binding(get: { hiragana }, set: { hiragana = $0 || !katakana }))
                Toggle("Katakana  カタカナ", isOn: Binding(get: { katakana }, set: { katakana = $0 || !hiragana }))
            }
            Section {
                LabeledContent("Characters", value: "\(pool.count)")
                LabeledContent("Due now", value: "\(progress.dueCount(pool.map(\.id)))")
            } footer: {
                Text("Covers the full gojūon, dakuten/handakuten and yōon combinations.")
            }
        }
        .navigationTitle("Kana")
        .safeAreaInset(edge: .bottom) {
            ActionBar {
                NavigationLink {
                    KanaSessionView(hiragana: hiragana, katakana: katakana)
                } label: {
                    Label("Start drawing", systemImage: "pencil.tip").frame(maxWidth: .infinity)
                }
                .buttonStyle(.glassProminent)
                .controlSize(.large)
                .disabled(pool.isEmpty)
            }
        }
    }
}

struct KanaSessionView: View {
    let hiragana: Bool
    let katakana: Bool
    @State private var session: StudySession<KanaCard>?

    var body: some View {
        Group {
            if let session {
                if session.isFinished {
                    SessionCompleteView(reviewed: session.index, correct: session.correct) { start() }
                } else if let card = session.current {
                    KanaCardView(card: card, session: session).id("\(session.index)-\(card.id)")
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle("Kana")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if let session, !session.isFinished {
                ToolbarItem(placement: .topBarTrailing) {
                    UndoButton(isEnabled: session.canUndo) { withAnimation { session.undo() } }
                }
            }
        }
        .onAppear { if session == nil { start() } }
    }

    private func start() {
        session = StudySession(cards: StudySession.pick(from: KanaCard.pool(hiragana: hiragana, katakana: katakana)))
    }
}

private struct KanaCardView: View {
    let card: KanaCard
    let session: StudySession<KanaCard>

    @State private var drawing = PKDrawing()
    @State private var revealed = false

    var body: some View {
        VStack(spacing: 16) {
            SessionProgressBar(index: session.index, total: session.total, progress: session.progress)
            VStack(spacing: 6) {
                Tag(text: card.scriptName, tint: card.isKatakana ? .orange : .green)
                Text(card.romaji).font(.system(size: 52, weight: .bold, design: .rounded))
            }

            ZStack {
                RoundedRectangle(cornerRadius: 24).fill(.background.secondary)
                GuideLines().stroke(.quaternary, style: StrokeStyle(lineWidth: 1, dash: [6, 6]))
                if revealed {
                    Text(card.kana)
                        .font(.system(size: 180))
                        .minimumScaleFactor(0.3)
                        .foregroundStyle(Color.accentColor.opacity(0.25))
                        .transition(.opacity)
                }
                DrawingCanvas(drawing: $drawing)
            }
            .aspectRatio(1, contentMode: .fit)
            .clipShape(.rect(cornerRadius: 24))
            .overlay(alignment: .topTrailing) {
                Button("Clear", systemImage: "eraser") { drawing = PKDrawing() }
                    .labelStyle(.iconOnly)
                    .buttonStyle(.glass)
                    .padding(10)
                    .disabled(drawing.strokes.isEmpty)
            }
            .padding(.horizontal)

            if revealed {
                HStack(spacing: 10) {
                    Text(card.kana).font(.system(size: 44, weight: .medium))
                    Text("\(card.romaji) · \(card.scriptName)").foregroundStyle(.secondary)
                }
                .transition(.opacity)
            }
            Spacer(minLength: 0)
        }
        .safeAreaInset(edge: .bottom) {
            ActionBar {
                if revealed {
                    GradeButtons(againTitle: "Didn't know", easyTitle: "Got it") { grade in
                        withAnimation { session.grade(grade, correct: grade == .easy) }
                    }
                } else {
                    PrimaryActionButton(title: "Show Answer", systemImage: "eye") {
                        withAnimation(.snappy) { revealed = true }
                    }
                }
            }
        }
    }
}

/// Faint cross guides, like a writing practice square.
private nonisolated struct GuideLines: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.midX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.midX, y: rect.maxY))
        path.move(to: CGPoint(x: rect.minX, y: rect.midY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.midY))
        return path
    }
}

/// PencilKit canvas that accepts finger and Apple Pencil input.
private struct DrawingCanvas: UIViewRepresentable {
    @Binding var drawing: PKDrawing

    func makeCoordinator() -> Coordinator { Coordinator(drawing: $drawing) }

    func makeUIView(context: Context) -> PKCanvasView {
        let canvas = PKCanvasView()
        canvas.drawingPolicy = .anyInput
        canvas.tool = PKInkingTool(.pen, color: .label, width: 12)
        canvas.backgroundColor = .clear
        canvas.isOpaque = false
        canvas.isScrollEnabled = false
        canvas.delegate = context.coordinator
        return canvas
    }

    func updateUIView(_ canvas: PKCanvasView, context: Context) {
        if canvas.drawing != drawing { canvas.drawing = drawing }
    }

    final class Coordinator: NSObject, PKCanvasViewDelegate {
        var drawing: Binding<PKDrawing>

        init(drawing: Binding<PKDrawing>) { self.drawing = drawing }

        func canvasViewDrawingDidChange(_ canvasView: PKCanvasView) {
            if drawing.wrappedValue != canvasView.drawing { drawing.wrappedValue = canvasView.drawing }
        }
    }
}
