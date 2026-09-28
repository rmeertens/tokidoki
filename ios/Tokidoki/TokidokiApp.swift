import SwiftUI

@main
struct TokidokiApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    var body: some View {
        ExerciseWebView()
            .ignoresSafeArea()
    }
}
