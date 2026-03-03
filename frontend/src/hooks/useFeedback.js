import { useEffect, useRef, useState } from 'react'

export function useFeedback() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const confirmationResolverRef = useRef(null)

  const clearFeedback = () => {
    setMessage('')
    setError('')
  }

  const clearMessage = () => {
    setMessage('')
  }

  const clearError = () => {
    setError('')
  }

  const askConfirmation = (text) =>
    new Promise((resolve) => {
      confirmationResolverRef.current = resolve
      setConfirmationMessage(text)
    })

  const handleConfirmation = (confirmed) => {
    if (confirmationResolverRef.current) {
      confirmationResolverRef.current(confirmed)
      confirmationResolverRef.current = null
    }
    setConfirmationMessage('')
  }

  useEffect(
    () => () => {
      if (confirmationResolverRef.current) {
        confirmationResolverRef.current(false)
        confirmationResolverRef.current = null
      }
    },
    []
  )

  return {
    message,
    error,
    confirmationMessage,
    setMessage,
    setError,
    clearFeedback,
    clearMessage,
    clearError,
    askConfirmation,
    handleConfirmation,
  }
}
