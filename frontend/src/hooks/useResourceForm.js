import { useState } from 'react'
import { request } from '../api/request'
import { initialForm, toTagsArray } from '../utils/tags'

export function useResourceForm({ loadResources, setMessage, setError, clearFeedback }) {
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const [searchId, setSearchId] = useState('')
  const [isSearching, setIsSearching] = useState(false)

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

  const handleSearchIdChange = (event) => {
    setSearchId(event.target.value)
  }

  return {
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
  }
}
