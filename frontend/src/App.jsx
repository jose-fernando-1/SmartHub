import AppHeader from './components/AppHeader'
import FeedbackToasts from './components/FeedbackToasts'
import ResourceFormPanel from './components/ResourceFormPanel'
import ResourcesPanel from './components/ResourcesPanel'
import { useFeedback } from './hooks/useFeedback'
import { useHealthStatus } from './hooks/useHealthStatus'
import { useResourceForm } from './hooks/useResourceForm'
import { useResources } from './hooks/useResources'

function App() {
  const {
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
  } = useFeedback()

  const { healthStatus, isCheckingHealth, healthCheckedAgo, checkHealth } = useHealthStatus({ setError })

  const {
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
  } = useResources({ setError, setMessage, clearFeedback, askConfirmation })

  const {
    form,
    editingId,
    isSaving,
    isGeneratingAI,
    searchId,
    isSearching,
    handleChange,
    resetForm,
    populateForm,
    handleSubmit,
    handleGenerateAI,
    handleSearchById,
    handleSearchIdChange,
  } = useResourceForm({ loadResources, setMessage, setError, clearFeedback })

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
        <AppHeader
          healthStatus={healthStatus}
          healthCheckedAgo={healthCheckedAgo}
          isCheckingHealth={isCheckingHealth}
          onCheckHealth={checkHealth}
        />

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <ResourceFormPanel
            editingId={editingId}
            form={form}
            isGeneratingAI={isGeneratingAI}
            isSaving={isSaving}
            onChange={handleChange}
            onGenerateAI={handleGenerateAI}
            onSubmit={handleSubmit}
            onReset={resetForm}
            searchId={searchId}
            isSearching={isSearching}
            onSearchIdChange={handleSearchIdChange}
            onSearchById={handleSearchById}
          />

          <ResourcesPanel
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            total={total}
            isLoadingResources={isLoadingResources}
            resources={resources}
            onPageSizeChange={handlePageSizeChange}
            onEdit={populateForm}
            onDelete={handleDelete}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />
        </section>
      </div>

      <FeedbackToasts
        message={message}
        error={error}
        confirmationMessage={confirmationMessage}
        onCloseMessage={clearMessage}
        onCloseError={clearError}
        onConfirm={() => handleConfirmation(true)}
        onCancel={() => handleConfirmation(false)}
      />
    </main>
  )
}

export default App
