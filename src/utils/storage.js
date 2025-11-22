const STORAGE_KEY = 'kelime-defterim-words'

export function getWords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('localStorage read error', e)
    return []
  }
}

export function setWords(words) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
  } catch (e) {
    console.error('localStorage write error', e)
  }
}

export function addWord(word) {
  const words = getWords()
  words.push({ ...word, createdAt: new Date().toISOString() })
  setWords(words)
  return words
}

export const storageKey = STORAGE_KEY