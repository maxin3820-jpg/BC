/**
 * Smart search — tolerant of extra spaces, matches all words individually.
 * "algrow courses" matches a course containing both "algrow" AND "courses"
 * "  algrow  " (extra spaces) still matches "algrow"
 */
export const matchesSearch = (text, query) => {
  if (!query || !query.trim()) return true
  const haystack = (text || '').toLowerCase()
  // Split by whitespace, remove empty strings, match ALL words
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  return words.every(word => haystack.includes(word))
}

export const courseMatchesSearch = (course, query) => {
  if (!query || !query.trim()) return true
  const combined = `${course.title || ''} ${course.description || ''}`
  return matchesSearch(combined, query)
}

export const packMatchesSearch = (pack, query) => {
  if (!query || !query.trim()) return true
  const combined = `${pack.title || ''} ${pack.description || ''}`
  return matchesSearch(combined, query)
}
