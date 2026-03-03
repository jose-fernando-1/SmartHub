import { useEffect } from 'react'

function FeedbackToasts({
  message,
  error,
  confirmationMessage,
  onCloseMessage,
  onCloseError,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!message) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      onCloseMessage()
    }, 3500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [message, onCloseMessage])

  useEffect(() => {
    if (!error) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      onCloseError()
    }, 4500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [error, onCloseError])

  if (!message && !error && !confirmationMessage) {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,380px)] flex-col gap-3">
      {message && (
        <div className="pointer-events-auto rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-md">
          <p className="text-sm font-medium text-emerald-800">{message}</p>
        </div>
      )}

      {error && (
        <div className="pointer-events-auto rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-md">
          <p className="text-sm font-medium text-rose-800">{error}</p>
        </div>
      )}

      {confirmationMessage && (
        <div className="pointer-events-auto rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-md">
          <p className="text-sm font-medium text-amber-900">{confirmationMessage}</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm text-white transition-colors duration-200 hover:bg-rose-700"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeedbackToasts