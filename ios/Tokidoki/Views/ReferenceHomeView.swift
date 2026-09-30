import SwiftUI

/// Browsable reference material (the website's hover pages and conjugation tables).
struct ReferenceHomeView: View {
    var body: some View {
        List {
            Section("Grammar") {
                NavigationLink {
                    ConjugationReferenceView()
                } label: {
                    IconRow(title: "Conjugation", subtitle: "Every verb & adjective form, with rules", systemImage: "tablecells", tint: .blue)
                }
            }
            Section("Kanji & Vocabulary") {
                NavigationLink {
                    KanjiBrowseView()
                } label: {
                    IconRow(title: "Kanji", subtitle: "JLPT N5–N1 · tap to reveal", systemImage: "character.book.closed.ja", tint: .purple)
                }
                NavigationLink {
                    VocabularyView()
                } label: {
                    IconRow(title: "Vocabulary", subtitle: "JLPT N5–N3 words · tap to reveal", systemImage: "text.book.closed", tint: .teal)
                }
                NavigationLink {
                    WordsByKanjiView()
                } label: {
                    IconRow(title: "Words by Kanji", subtitle: "See every word that uses a kanji", systemImage: "square.grid.3x3", tint: .orange)
                }
                NavigationLink {
                    SimilarKanjiView()
                } label: {
                    IconRow(title: "Look-alike Kanji", subtitle: "Groups of kanji that are easy to mix up", systemImage: "eyes", tint: .pink)
                }
            }
        }
        .navigationTitle("Reference")
    }
}
