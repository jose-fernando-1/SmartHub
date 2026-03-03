function ResourcesPanel({
  page,
  pageSize,
  totalPages,
  total,
  isLoadingResources,
  resources,
  onPageSizeChange,
  onEdit,
  onDelete,
  onPreviousPage,
  onNextPage,
}) {
  return (
    <article className="rounded-xl bg-white p-6 shadow-sm lg:col-span-3">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Recursos cadastrados</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm text-gray-600">
            Itens por página
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={onPageSizeChange}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm transition-colors duration-200 hover:border-gray-400"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {isLoadingResources ? (
        <p className="text-sm text-gray-600">Carregando recursos...</p>
      ) : resources.length === 0 ? (
        <p className="text-sm text-gray-600">Nenhum recurso encontrado.</p>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold">
                    #{resource.id} - {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600">Tipo: {resource.type}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(resource)}
                    className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-sm"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(resource.id)}
                    className="w-24 rounded-lg bg-rose-600 px-3 py-1.5 text-sm text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-md"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-700">{resource.description || 'Sem descrição.'}</p>

              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block text-sm text-blue-700 transition-colors duration-200 hover:text-blue-800 hover:underline"
              >
                {resource.url}
              </a>

              <div className="mt-2 flex flex-wrap gap-2">
                {(resource.tags ?? []).length > 0 ? (
                  resource.tags.map((tag) => (
                    <span
                      key={`${resource.id}-${tag}`}
                      className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">Sem tags</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
        <span className="text-sm text-gray-600">
          Página {page} de {totalPages} • Total: {total}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPreviousPage}
            disabled={page <= 1 || isLoadingResources}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={page >= totalPages || isLoadingResources}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            Próxima
          </button>
        </div>
      </div>
    </article>
  )
}

export default ResourcesPanel
