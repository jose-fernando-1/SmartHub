import { useCallback, useEffect, useMemo, useState } from 'react'
import { request } from '../api/request'

export function useResources({ setError, setMessage, clearFeedback }) {
  const [resources, setResources] = useState([])
  const [isLoadingResources, setIsLoadingResources] = useState(false)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [total, setTotal] = useState(0)

  const totalPages = useMemo(() => {
    if (!total || !pageSize) return 1
    return Math.max(1, Math.ceil(total / pageSize))
  }, [total, pageSize])

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

  const handleDelete = useCallback(
    async (resourceId) => {
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
    },
    [clearFeedback, total, pageSize, page, loadResources, setMessage, setError],
  )

  const handlePageSizeChange = useCallback((event) => {
    setPageSize(Number(event.target.value))
    setPage(1)
  }, [])

  const handlePreviousPage = useCallback(() => {
    setPage((previous) => Math.max(1, previous - 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setPage((previous) => Math.min(totalPages, previous + 1))
  }, [totalPages])

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
