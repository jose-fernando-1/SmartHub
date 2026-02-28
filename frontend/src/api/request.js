const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function request(path, options = {}) {
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
