export const initialForm = {
  title: '',
  description: '',
  type: 'Video',
  url: '',
  tags: '',
}

export function toTagsArray(tags) {
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}
