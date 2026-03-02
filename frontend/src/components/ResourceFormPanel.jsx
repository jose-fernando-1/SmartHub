function ResourceFormPanel({
  editingId,
  form,
  isGeneratingAI,
  isSaving,
  onChange,
  onGenerateAI,
  onSubmit,
  onReset,
  searchId,
  isSearching,
  onSearchIdChange,
  onSearchById,
}) {
  return (
    <article className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
      <h2 className="text-xl font-semibold">{editingId ? `Editar recurso #${editingId}` : 'Novo recurso'}</h2>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="title">
            Título
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-gray-300 transition-colors duration-200 hover:border-gray-400 focus:ring"
            placeholder="Ex: Curso de React"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="type">
            Tipo
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-gray-300 transition-colors duration-200 hover:border-gray-400 focus:ring"
          >
            <option value="Video">Video</option>
            <option value="PDF">PDF</option>
            <option value="Link">Link</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="url">
            URL
          </label>
          <input
            id="url"
            name="url"
            value={form.url}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-gray-300 transition-colors duration-200 hover:border-gray-400 focus:ring"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="description">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={onChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-gray-300 transition-colors duration-200 hover:border-gray-400 focus:ring"
            placeholder="Descrição do recurso"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="tags">
            Tags (separadas por vírgula)
          </label>
          <input
            id="tags"
            name="tags"
            value={form.tags}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-gray-300 transition-colors duration-200 hover:border-gray-400 focus:ring"
            placeholder="react, frontend, javascript"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={onGenerateAI}
            disabled={isGeneratingAI}
            className="w-40 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            {isGeneratingAI ? 'Gerando...' : 'Gerar com IA'}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="w-40 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            {isSaving ? 'Salvando...' : editingId ? 'Atualizar recurso' : 'Criar recurso'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-sm"
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <div className="mt-5 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold">Buscar recurso por ID</h3>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            min="1"
            value={searchId}
            onChange={onSearchIdChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-gray-300 transition-colors duration-200 hover:border-gray-400 focus:ring"
            placeholder="Digite o ID"
          />
          <button
            type="button"
            onClick={onSearchById}
            disabled={isSearching}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ResourceFormPanel
