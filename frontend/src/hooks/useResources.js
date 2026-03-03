import { useCallback, useEffect, useState } from 'react'
import { request } from '../api/request'

export function useResources({ setError, setMessage, clearFeedback }) {
  const [resources, setResources] = useState([])
  const [isLoadingResources, setIsLoadingResources] = useState(false)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [total, setTotal] = useState(0)

  const totalPages = !total || !pageSize ? 1 : Math.max(1, Math.ceil(total / pageSize))

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
  }, [page, pageSize, setError])

  useEffect(() => {
    loadResources()
  }, [loadResources])

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

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value))
    setPage(1)
  }

  const handlePreviousPage = () => {
    setPage((previous) => Math.max(1, previous - 1))
  }

  const handleNextPage = () => {
    setPage((previous) => Math.min(totalPages, previous + 1))
  }

  return {
    resources,
    isLoadingResources,
    page,
    pageSize,
    total,
    totalPages,
    loadResources,
    handleDelete,
    handlePageSizeChange,
    handlePreviousPage,
    handleNextPage,
  }
}
