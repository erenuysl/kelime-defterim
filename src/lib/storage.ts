/**
 * localStorage data layer V2 — Day + Set model for Kelime Defterim
 */

// V2 types
export type Word = {
  id: string
  eng: string
  tr: string
  synonym?: string
  createdAt: string
}

export type Set = {
  id: string
  name: string
  createdAt: string
  words: Word[]
}

export type Day = {
  id: string // YYYY-MM-DD
  name: string
  dateISO: string
  createdAt: string
  sets: Set[]
}

export type Vault = {
  days: Day[]
  lastOpenedDayId?: string
  version: 2
}

export const KEY = 'KD_VAULT_V2'

// Legacy compatibility types for existing screens
export type LegacyWord = {
  id: string
  english: string
  turkish: string
  synonym?: string
  createdAt: string
}

export type LegacyDay = {
  id: string
  dateISO: string
  words: LegacyWord[]
}

export function toTRDate(d: Date): string {
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ID helpers per spec
function dayIdForDateISO(date: Date): string {
  return date.toISOString().slice(0, 10)
}
function setId(): string { return 'set_' + Math.random().toString(36).slice(2, 8) }
function wordId(): string { return 'w_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5) }

// Storage helpers
export function loadVault(): Vault {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { days: [], version: 2 }
    const parsed = JSON.parse(raw)
    if (parsed?.version !== 2 || !Array.isArray(parsed?.days)) throw new Error('Invalid vault v2 format')
    return JSON.parse(JSON.stringify(parsed)) as Vault
  } catch (e) {
    throw new Error(`Failed to load vault v2: ${(e as Error).message}`)
  }
}

export function saveVault(v: Vault): void {
  if (!v || v.version !== 2 || !Array.isArray(v.days)) throw new Error('Cannot save: invalid v2 vault')
  localStorage.setItem(KEY, JSON.stringify(v))
}

// V2 operations (pure and robust — they load, update, save, and return cloned data)
export function createDay(name?: string, date?: Date): Day {
  const d = date ?? new Date()
  const id = dayIdForDateISO(d)
  const newDay: Day = { id, name: name?.trim() || toTRDate(d), dateISO: id, createdAt: new Date().toISOString(), sets: [] }
  const v = loadVault()
  const exists = v.days.find(x => x.id === id)
  const nextDays = exists ? v.days.map(x => (x.id === id ? newDay : x)) : [newDay, ...v.days]
  const next: Vault = { ...v, days: nextDays }
  saveVault(next)
  return JSON.parse(JSON.stringify(newDay))
}

export function createSet(dayId: string, name?: string): Set {
  const v = loadVault()
  const di = v.days.findIndex(d => d.id === dayId)
  if (di < 0) throw new Error('Day not found')
  const s: Set = { id: setId(), name: (name?.trim() || 'Set'), createdAt: new Date().toISOString(), words: [] }
  const day = v.days[di]
  const nextDay: Day = { ...day, sets: [s, ...day.sets] }
  const next: Vault = { ...v, days: v.days.map((d, i) => (i === di ? nextDay : d)) }
  saveVault(next)
  return JSON.parse(JSON.stringify(s))
}

export function addWordToSet(dayId: string, setIdTarget: string, word: Omit<Word, 'id' | 'createdAt'>): Word {
  const v = loadVault()
  const di = v.days.findIndex(d => d.id === dayId)
  if (di < 0) throw new Error('Day not found')
  const day = v.days[di]
  const si = day.sets.findIndex(s => s.id === setIdTarget)
  if (si < 0) throw new Error('Set not found')
  const newWord: Word = { id: wordId(), eng: word.eng.trim(), tr: word.tr.trim(), synonym: word.synonym?.trim() || undefined, createdAt: new Date().toISOString() }
  const set = day.sets[si]
  const nextSet: Set = { ...set, words: [...set.words, newWord] }
  const nextDay: Day = { ...day, sets: day.sets.map((s, i) => (i === si ? nextSet : s)) }
  const next: Vault = { ...v, days: v.days.map((d, i) => (i === di ? nextDay : d)) }
  saveVault(next)
  return JSON.parse(JSON.stringify(newWord))
}

export function updateWord(dayId: string, setIdTarget: string, wordIdTarget: string, patch: Partial<Word>): Word {
  const v = loadVault()
  const di = v.days.findIndex(d => d.id === dayId)
  if (di < 0) throw new Error('Day not found')
  const day = v.days[di]
  const si = day.sets.findIndex(s => s.id === setIdTarget)
  if (si < 0) throw new Error('Set not found')
  const set = day.sets[si]
  const wi = set.words.findIndex(w => w.id === wordIdTarget)
  if (wi < 0) throw new Error('Word not found')
  const w = set.words[wi]
  const nextW: Word = {
    ...w,
    eng: patch.eng !== undefined ? String(patch.eng) : w.eng,
    tr: patch.tr !== undefined ? String(patch.tr) : w.tr,
    synonym: patch.synonym !== undefined ? (patch.synonym || undefined) : w.synonym,
  }
  const nextSet: Set = { ...set, words: set.words.map((x, i) => (i === wi ? nextW : x)) }
  const nextDay: Day = { ...day, sets: day.sets.map((s, i) => (i === si ? nextSet : s)) }
  const next: Vault = { ...v, days: v.days.map((d, i) => (i === di ? nextDay : d)) }
  saveVault(next)
  return JSON.parse(JSON.stringify(nextW))
}

export function removeWord(dayId: string, setIdTarget: string, wordIdTarget: string): void {
  const v = loadVault()
  const di = v.days.findIndex(d => d.id === dayId)
  if (di < 0) throw new Error('Day not found')
  const day = v.days[di]
  const si = day.sets.findIndex(s => s.id === setIdTarget)
  if (si < 0) throw new Error('Set not found')
  const set = day.sets[si]
  if (!set.words.some(w => w.id === wordIdTarget)) throw new Error('Word not found')
  const nextSet: Set = { ...set, words: set.words.filter(w => w.id !== wordIdTarget) }
  const nextDay: Day = { ...day, sets: day.sets.map((s, i) => (i === si ? nextSet : s)) }
  const next: Vault = { ...v, days: v.days.map((d, i) => (i === di ? nextDay : d)) }
  saveVault(next)
}

export function renameSet(dayId: string, setIdTarget: string, newName: string): Set {
  const v = loadVault()
  const di = v.days.findIndex(d => d.id === dayId)
  if (di < 0) throw new Error('Day not found')
  const day = v.days[di]
  const si = day.sets.findIndex(s => s.id === setIdTarget)
  if (si < 0) throw new Error('Set not found')
  const set = day.sets[si]
  const nextSet: Set = { ...set, name: newName.trim() || set.name }
  const nextDay: Day = { ...day, sets: day.sets.map((s, i) => (i === si ? nextSet : s)) }
  const next: Vault = { ...v, days: v.days.map((d, i) => (i === di ? nextDay : d)) }
  saveVault(next)
  return JSON.parse(JSON.stringify(nextSet))
}

export function deleteSet(dayId: string, setIdTarget: string): void {
  const v = loadVault()
  const di = v.days.findIndex(d => d.id === dayId)
  if (di < 0) throw new Error('Day not found')
  const day = v.days[di]
  const nextDay: Day = { ...day, sets: day.sets.filter(s => s.id !== setIdTarget) }
  const next: Vault = { ...v, days: v.days.map((d, i) => (i === di ? nextDay : d)) }
  saveVault(next)
}

export function getDay(dayId: string): Day | undefined
export function getDay(vault: Vault, dayId: string): LegacyDay | undefined
export function getDay(arg1: any, arg2?: any): any {
  if (typeof arg1 === 'string') {
    const v = loadVault()
    const d = v.days.find(x => x.id === arg1)
    return d ? JSON.parse(JSON.stringify(d)) : undefined
  }
  const v: Vault = arg1
  const id: string = arg2
  const d = v.days.find(x => x.id === id)
  if (!d) return undefined
  const words: LegacyWord[] = d.sets.flatMap(s => s.words.map(w => ({ id: w.id, english: w.eng, turkish: w.tr, synonym: w.synonym, createdAt: w.createdAt })))
  return { id: d.id, dateISO: d.dateISO, words }
}

export function listDays(): Day[]
export function listDays(vault: Vault): LegacyDay[]
export function listDays(arg?: any): any {
  if (!arg) {
    const v = loadVault()
    return JSON.parse(JSON.stringify(v.days)).sort((a: Day, b: Day) => (a.dateISO < b.dateISO ? 1 : -1))
  }
  const v: Vault = arg
  const mapped: LegacyDay[] = v.days
    .map(d => ({ id: d.id, dateISO: d.dateISO, words: d.sets.flatMap(s => s.words.map(w => ({ id: w.id, english: w.eng, turkish: w.tr, synonym: w.synonym, createdAt: w.createdAt }))) }))
    .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
  return mapped
}

export function listSets(dayId: string): Set[] {
  const v = loadVault()
  const d = v.days.find(x => x.id === dayId)
  return d ? JSON.parse(JSON.stringify(d.sets)) : []
}

export function getSet(dayId: string, setId: string): Set | undefined {
  const v = loadVault()
  const d = v.days.find(x => x.id === dayId)
  if (!d) return undefined
  const s = d.sets.find(s => s.id === setId)
  return s ? JSON.parse(JSON.stringify(s)) : undefined
}

export function upsertLastOpened(dayId: string): void
export function upsertLastOpened(vault: Vault, date: Date): { vault: Vault; dayId: string }
export function upsertLastOpened(arg1: any, arg2?: any): any {
  if (typeof arg1 === 'string') {
    const v = loadVault()
    const d = v.days.find(x => x.id === arg1) || createDay(undefined, new Date(arg1))
    const next: Vault = { ...loadVault(), lastOpenedDayId: d.id }
    saveVault(next)
    return
  }
  const v: Vault = arg1
  const date: Date = arg2
  const id = dayIdForDateISO(date)
  const exists = v.days.find(x => x.id === id)
  const nextDays = exists ? v.days : [{ id, name: toTRDate(date), dateISO: id, createdAt: new Date().toISOString(), sets: [] }, ...v.days]
  const next: Vault = { ...v, days: nextDays, lastOpenedDayId: id, version: 2 }
  return { vault: next, dayId: id }
}

// Legacy word ops for compatibility (default "Kelimeler" set)
function ensureDefaultSet(d: Day): { day: Day; setId: string } {
  const def = d.sets.find(s => s.name === 'Kelimeler')
  if (def) return { day: d, setId: def.id }
  const created: Set = { id: setId(), name: 'Kelimeler', createdAt: new Date().toISOString(), words: [] }
  const nextDay: Day = { ...d, sets: [created, ...d.sets] }
  const v = loadVault()
  const next: Vault = { ...v, days: v.days.map(x => (x.id === d.id ? nextDay : x)) }
  saveVault(next)
  return { day: nextDay, setId: created.id }
}

export function addWord(vault: Vault, dayId: string, data: { english: string; turkish: string; synonym?: string }): Vault {
  const v = loadVault()
  const d = v.days.find(x => x.id === dayId)
  if (!d) throw new Error('Day not found')
  if (!data.english?.trim() || !data.turkish?.trim()) throw new Error('english and turkish required')
  const { day, setId } = ensureDefaultSet(d)
  const newWord: Word = { id: wordId(), eng: data.english.trim(), tr: data.turkish.trim(), synonym: data.synonym?.trim() || undefined, createdAt: new Date().toISOString() }
  const si = day.sets.findIndex(s => s.id === setId)
  const set = day.sets[si]
  const nextSet: Set = { ...set, words: [...set.words, newWord] }
  const nextDay: Day = { ...day, sets: day.sets.map((s, i) => (i === si ? nextSet : s)) }
  const nextVault: Vault = { ...v, days: v.days.map(x => (x.id === dayId ? nextDay : x)) }
  saveVault(nextVault)
  return JSON.parse(JSON.stringify(nextVault))
}

export function updateWordInVault(vault: Vault, dayId: string, wordIdTarget: string, patch: Partial<LegacyWord>): Vault {
  const v = loadVault()
  const d = v.days.find(x => x.id === dayId)
  if (!d) throw new Error('Day not found')
  const { day, setId } = ensureDefaultSet(d)
  const si = day.sets.findIndex(s => s.id === setId)
  const set = day.sets[si]
  const wi = set.words.findIndex(w => w.id === wordIdTarget)
  if (wi < 0) throw new Error('Word not found')
  const w = set.words[wi]
  const nextW: Word = {
    ...w,
    eng: patch.english !== undefined ? String(patch.english) : w.eng,
    tr: patch.turkish !== undefined ? String(patch.turkish) : w.tr,
    synonym: patch.synonym !== undefined ? (patch.synonym || undefined) : w.synonym,
  }
  const nextSet: Set = { ...set, words: set.words.map((x, i) => (i === wi ? nextW : x)) }
  const nextDay: Day = { ...day, sets: day.sets.map((s, i) => (i === si ? nextSet : s)) }
  const nextVault: Vault = { ...v, days: v.days.map(x => (x.id === dayId ? nextDay : x)) }
  saveVault(nextVault)
  return JSON.parse(JSON.stringify(nextVault))
}

export function removeWordInVault(vault: Vault, dayId: string, wordIdTarget: string): Vault {
  const v = loadVault()
  const d = v.days.find(x => x.id === dayId)
  if (!d) throw new Error('Day not found')
  const { day, setId } = ensureDefaultSet(d)
  const si = day.sets.findIndex(s => s.id === setId)
  const set = day.sets[si]
  if (!set.words.some(w => w.id === wordIdTarget)) throw new Error('Word not found')
  const nextSet: Set = { ...set, words: set.words.filter(w => w.id !== wordIdTarget) }
  const nextDay: Day = { ...day, sets: day.sets.map((s, i) => (i === si ? nextSet : s)) }
  const nextVault: Vault = { ...v, days: v.days.map(x => (x.id === dayId ? nextDay : x)) }
  saveVault(nextVault)
  return JSON.parse(JSON.stringify(nextVault))
}