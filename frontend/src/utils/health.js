export function formatHealthCheckedAgo(lastHealthCheckAt, now) {
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
}
