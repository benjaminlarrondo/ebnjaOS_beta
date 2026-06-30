import SwiftUI

struct BrainView: View {
    @EnvironmentObject private var store: BrainStore
    @State private var showCapture = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                header
                summaryCard
                searchCard
                filterCard
                inboxCard
                listCard
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 24)
        }
        .scrollIndicators(.hidden)
        .sheet(isPresented: $showCapture) {
            BrainCaptureSheet(store: store)
        }
    }

    private var header: some View {
        CompactSectionHeader(
            title: "Brain",
            subtitle: "Inbox, notas, ideas, decisiones y proyectos.",
            trailing: AnyView(
                Button {
                    showCapture = true
                } label: {
                    Label("+ Captura", systemImage: "plus.circle.fill")
                }
                .buttonStyle(.borderedProminent)
            )
        )
    }

    private var summaryCard: some View {
        SectionCard(title: "Resumen", subtitle: "Últimas capturas y persistencia local") {
            VStack(alignment: .leading, spacing: 8) {
                CompactStatusRow(label: "Inbox", value: "\(store.inboxCount)", detail: store.lastCaptureText)
                CompactStatusRow(label: "Última actualización", value: store.lastUpdatedText, detail: store.syncStatusText)
            }
        }
    }

    private var searchCard: some View {
        SectionCard(title: "Búsqueda", subtitle: "Encuentra una nota, idea o decisión") {
            TextField("Buscar...", text: $store.searchText)
                .textFieldStyle(.roundedBorder)
        }
    }

    private var filterCard: some View {
        SectionCard(title: "Filtros", subtitle: "Tipos de Brain") {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    filterChip(title: "Todos", isSelected: store.selectedFilter == nil) {
                        store.toggleFilter(nil)
                    }
                    ForEach(BrainItemType.allCases) { type in
                        filterChip(title: type.displayName, isSelected: store.selectedFilter == type) {
                            store.toggleFilter(type)
                        }
                    }
                }
            }
        }
    }

    private var inboxCard: some View {
        SectionCard(title: "Inbox", subtitle: "Últimas capturas") {
            if store.filteredItems.isEmpty {
                Text("Inbox vacío. Captura algo para empezar.")
                    .foregroundStyle(.secondary)
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(store.filteredItems.prefix(3)) { item in
                        NavigationLink {
                            BrainDetailView(item: item)
                        } label: {
                            BrainRow(item: item)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var listCard: some View {
        SectionCard(title: "Capturas", subtitle: "Persistencia local-first") {
            VStack(alignment: .leading, spacing: 8) {
                ForEach(store.filteredItems) { item in
                    NavigationLink {
                        BrainDetailView(item: item)
                    } label: {
                        BrainRow(item: item)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func filterChip(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.caption.weight(.semibold))
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(isSelected ? Color.accentColor.opacity(0.16) : Color.secondary.opacity(0.10))
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }
}

private struct BrainRow: View {
    let item: BrainItem

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: iconName)
                .font(.system(size: 15, weight: .semibold))
                .frame(width: 26, height: 26)
                .background(.thinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(1)
                Text(item.content)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            Spacer()
        }
        .padding(10)
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private var iconName: String {
        switch item.type {
        case .note: return "note.text"
        case .idea: return "lightbulb"
        case .decision: return "checkmark.seal"
        case .task: return "checklist"
        case .project: return "folder"
        }
    }
}

private struct BrainDetailView: View {
    let item: BrainItem

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                SectionCard(title: item.title, subtitle: item.type.displayName) {
                    VStack(alignment: .leading, spacing: 8) {
                        CompactStatusRow(label: "Fecha", value: item.createdAt.formatted(date: .abbreviated, time: .shortened), detail: nil)
                        CompactStatusRow(label: "Tags", value: item.tags.isEmpty ? "Sin tags" : item.tags.joined(separator: ", "), detail: item.linkedModule)
                        Text(item.content)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Detalle")
    }
}

private struct BrainCaptureSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var title: String = ""
    @State private var content: String = ""
    @State private var tags: String = ""
    @State private var linkedModule: String = ""
    @State private var type: BrainItemType = .note
    let store: BrainStore

    var body: some View {
        NavigationStack {
            Form {
                Section("Nueva captura") {
                    Picker("Tipo", selection: $type) {
                        ForEach(BrainItemType.allCases) { type in
                            Text(type.displayName).tag(type)
                        }
                    }
                    TextField("Título", text: $title)
                    TextEditor(text: $content)
                        .frame(minHeight: 120)
                    TextField("Tags separadas por coma", text: $tags)
                    TextField("Módulo vinculado (opcional)", text: $linkedModule)
                }
            }
            .navigationTitle("+ Captura")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Guardar") {
                        let parsedTags = tags
                            .split(separator: ",")
                            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                            .filter { !$0.isEmpty }
                        store.addItem(title: title, content: content, type: type, tags: parsedTags, linkedModule: linkedModule.isEmpty ? nil : linkedModule)
                        dismiss()
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
    }
}
