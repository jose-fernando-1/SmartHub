import { useState } from 'react'

export function useFeedback() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const clearFeedback = () => {
    setMessage('')
    setError('')
  }

  return {
    message,
    error,
    setMessage,
    setError,
    clearFeedback,
  }
}
