import SwiftUI

@main
struct TokidokiApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
                .preferredColorScheme(AppSettings.shared.appearance.colorScheme)
        }
    }
}

struct RootView: View {
    var body: some View {
        TabView {
            Tab("Practice", systemImage: "graduationcap") {
                NavigationStack { HomeView() }
            }
            Tab("Reference", systemImage: "books.vertical") {
                NavigationStack { ReferenceHomeView() }
            }
            Tab("Sheets", systemImage: "printer") {
                NavigationStack { PracticeSheetsView() }
            }
            Tab("Settings", systemImage: "gearshape") {
                NavigationStack { SettingsView() }
            }
        }
    }
}
