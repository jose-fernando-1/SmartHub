import { useCallback, useEffect, useState } from 'react'
import { request } from '../api/request'
import { formatHealthCheckedAgo } from '../utils/health'

export function useHealthStatus({ setError }) {
  const [healthStatus, setHealthStatus] = useState('Carregando...')
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)
  const [lastHealthCheckAt, setLastHealthCheckAt] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  const healthCheckedAgo = formatHealthCheckedAgo(lastHealthCheckAt, now)

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
  }, [setError])

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

  return {
    healthStatus,
    isCheckingHealth,
    healthCheckedAgo,
    checkHealth,
  }
}
