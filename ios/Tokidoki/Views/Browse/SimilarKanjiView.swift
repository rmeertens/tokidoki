import SwiftUI

/// Browse groups of visually similar kanji.
struct SimilarKanjiView: View {
    @State private var levels: Set<JLPTLevel> = [.n5, .n4, .n3]
    @State private var search = ""

    private struct KanjiGroup: Identifiable {
        let id: Int
        let members: [(kanji: String, meaning: String, level: String)]
    }

    private var groups: [KanjiGroup] {
        let query = search.trimmingCharacters(in: .whitespaces).lowercased()
        return Library.shared.confusableGroups.enumerated().compactMap { index, group in
            let members = group.kanji.compactMap { kanji -> (kanji: String, meaning: String, level: String)? in
                guard let level = group.levels[kanji], let jlpt = JLPTLevel(rawValue: level.lowercased()), levels.contains(jlpt) else { return nil }
                return (kanji, group.meanings[kanji] ?? "", level)
            }
            guard members.count > 1 else { return nil }
            let matches = query.isEmpty || members.contains { $0.kanji == query || $0.meaning.lowercased().contains(query) }
            return matches ? KanjiGroup(id: index, members: members) : nil
        }
    }

    var body: some View {
        let groups = groups
        List {
            Section {
                ForEach(groups) { group in
                    VStack(alignment: .leading, spacing: 8) {
                        Text("\(group.members.count) similar kanji").font(.caption).foregroundStyle(.secondary)
                        ScrollView(.horizontal) {
                            HStack(spacing: 10) {
                                ForEach(group.members, id: \.kanji) { member in
                                    VStack(spacing: 2) {
                                        Text(member.kanji).font(.system(size: 36))
                                        Text(member.meaning).font(.caption2).lineLimit(2).multilineTextAlignment(.center)
                                        Text(member.level).font(.caption2.weight(.semibold)).foregroundStyle(.secondary)
                                    }
                                    .frame(width: 84)
                                    .padding(.vertical, 8)
                                    .background(.fill.quaternary, in: .rect(cornerRadius: 12))
                                }
                            }
                        }
                        .scrollIndicators(.hidden)
                    }
                    .padding(.vertical, 4)
                }
            } footer: {
                Text("\(groups.count) groups · \(groups.reduce(0) { $0 + $1.members.count }) kanji")
            }
        }
        .overlay {
            if groups.isEmpty { ContentUnavailableView.search(text: search) }
        }
        .searchable(text: $search, prompt: "Kanji or meaning")
        .navigationTitle("Look-alike Kanji")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                LevelFilterMenu(levels: JLPTLevel.allCases, selection: $levels)
            }
        }
    }
}
