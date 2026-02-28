import { useCallback, useEffect, useMemo, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const initialForm = {
  title: '',
  description: '',
  type: 'Video',
  url: '',
  tags: '',
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      ...options,
    })
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw err
    }

    throw new Error('Falha de comunicação com a API. Verifique se o backend está disponível.')
  }

  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = data?.detail
    throw new Error(typeof detail === 'string' ? detail : 'Falha na requisição da API')
  }

  return data
}

function toTagsArray(tags) {
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function App() {
  const [healthStatus, setHealthStatus] = useState('Carregando...')
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)
  const [lastHealthCheckAt, setLastHealthCheckAt] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  const [resources, setResources] = useState([])
  const [isLoadingResources, setIsLoadingResources] = useState(false)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [total, setTotal] = useState(0)

  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const [searchId, setSearchId] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const totalPages = useMemo(() => {
    if (!total || !pageSize) return 1
    return Math.max(1, Math.ceil(total / pageSize))
  }, [total, pageSize])

  const healthCheckedAgo = useMemo(() => {
    if (!lastHealthCheckAt) return 'Não verificado'

    const diffInSeconds = Math.max(0, Math.floor((now - lastHealthCheckAt) / 1000))

    if (diffInSeconds < 10) return 'agora'
    if (diffInSeconds < 60) {
      const roundedSeconds = Math.floor(diffInSeconds / 10) * 10
      return `há ${roundedSeconds} segundos`
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`

    const diffInDays = Math.floor(diffInHours / 24)
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`
  }, [lastHealthCheckAt, now])

  const clearFeedback = () => {
    setMessage('')
    setError('')
  }

  const checkHealth = useCallback(async () => {
    setIsCheckingHealth(true)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 15000)

    try {
      const data = await request('/health', { method: 'GET', signal: controller.signal })
      setHealthStatus(data?.status ?? 'Ok')
    } catch (err) {
      if (err?.name === 'AbortError') {
        setHealthStatus('Timeout')
        setError('A verificação de status excedeu o tempo limite.')
      } else {
        setHealthStatus('Indisponível')
        setError(err.message || 'Falha ao comunicar com a API.')
      }
    } finally {
      window.clearTimeout(timeoutId)
      setLastHealthCheckAt(Date.now())
      setIsCheckingHealth(false)
    }
  }, [])

  const loadResources = useCallback(async () => {
    setIsLoadingResources(true)
    try {
      const data = await request(`/resources?page=${page}&page_size=${pageSize}`, {
        method: 'GET',
      })
      setResources(data.items ?? [])
      setTotal(data.total ?? 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoadingResources(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    checkHealth()
  }, [checkHealth])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 10000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
  }

  const populateForm = (resource) => {
    setForm({
      title: resource.title ?? '',
      description: resource.description ?? '',
      type: resource.type ?? 'Video',
      url: resource.url ?? '',
      tags: (resource.tags ?? []).join(', '),
    })
    setEditingId(resource.id)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    clearFeedback()

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      url: form.url.trim(),
      tags: toTagsArray(form.tags),
    }

    if (!payload.title || !payload.url) {
      setError('Preencha título e URL.')
      return
    }

    setIsSaving(true)
    try {
      if (editingId) {
        await request(`/resources/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setMessage('Recurso atualizado com sucesso.')
      } else {
        await request('/resources', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setMessage('Recurso criado com sucesso.')
      }

      resetForm()
      await loadResources()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (resourceId) => {
    clearFeedback()

    if (!window.confirm('Deseja realmente remover este recurso?')) {
      return
    }

    try {
      await request(`/resources/${resourceId}`, { method: 'DELETE' })

      const newTotal = Math.max(0, total - 1)
      const newTotalPages = Math.max(1, Math.ceil(newTotal / pageSize))
      if (page > newTotalPages) {
        setPage(newTotalPages)
      } else {
        await loadResources()
      }

      setMessage('Recurso removido com sucesso.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGenerateAI = async () => {
    clearFeedback()

    const title = form.title.trim()
    if (!title) {
      setError('Informe um título para gerar descrição e tags com IA.')
      return
    }

    setIsGeneratingAI(true)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 15000)

    try {
      const data = await request('/ai/generate', {
        method: 'POST',
        signal: controller.signal,
        body: JSON.stringify({
          title,
          type: form.type,
        }),
      })

      setForm((previous) => ({
        ...previous,
        description: data.description ?? previous.description,
        tags: (data.tags ?? []).join(', '),
      }))
      setMessage('Sugestões da IA aplicadas no formulário.')
    } catch (err) {
      if (err?.name === 'AbortError') {
        setError('A IA demorou para responder. Tente novamente em instantes.')
      } else {
        setError(err.message)
      }
    } finally {
      window.clearTimeout(timeoutId)
      setIsGeneratingAI(false)
    }
  }

  const handleSearchById = async () => {
    clearFeedback()

    const id = Number(searchId)
    if (!Number.isInteger(id) || id <= 0) {
      setError('Informe um ID válido para busca.')
      return
    }

    setIsSearching(true)
    try {
      const resource = await request(`/resources/${id}`, { method: 'GET' })
      populateForm(resource)
      setMessage(`Recurso #${id} carregado para edição.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
        <header className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">SmartHub</h1>
              <p className="text-sm text-gray-600">Hub inteligente de recursos educacionais</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-start gap-0.5">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                  API: <strong>{healthStatus}</strong>
                </span>
                <span className="text-xs text-gray-500">
                  {healthCheckedAgo === 'Não verificado'
                    ? healthCheckedAgo
                    : healthCheckedAgo === 'agora'
                      ? 'Verificado agora'
                      : `Verificado ${healthCheckedAgo}`}
                </span>
              </div>
              <button
                type="button"
                onClick={checkHealth}
                disabled={isCheckingHealth}
                className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
              >
                {isCheckingHealth ? 'Verificando...' : 'Verificar status'}
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <article className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-semibold">{editingId ? `Editar recurso #${editingId}` : 'Novo recurso'}</h2>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="title">
                  Título
                </label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-gray-300 transition-colors duration-200 hover:border-gray-400 focus:ring"
                  placeholder="react, frontend, javascript"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGenerateAI}
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
                    onClick={resetForm}
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
                  onChange={(event) => setSearchId(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-gray-300 transition-colors duration-200 hover:border-gray-400 focus:ring"
                  placeholder="Digite o ID"
                />
                <button
                  type="button"
                  onClick={handleSearchById}
                  disabled={isSearching}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </div>
          </article>

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
                  onChange={(event) => {
                    setPageSize(Number(event.target.value))
                    setPage(1)
                  }}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm transition-colors duration-200 hover:border-gray-400"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {message && <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
            {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

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
                          onClick={() => populateForm(resource)}
                          className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-sm"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(resource.id)}
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
                  onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                  disabled={page <= 1 || isLoadingResources}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
                  disabled={page >= totalPages || isLoadingResources}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  Próxima
                </button>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}

export default App
