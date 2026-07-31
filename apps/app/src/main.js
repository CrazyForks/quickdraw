import { createQuickdraw } from '@tryquickdraw/core'
import '@tryquickdraw/core/quickdraw.css'

const DOC_KEY = 'quickdraw-app-doc'
const THEME_KEY = 'quickdraw-app-theme'

const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
const theme = localStorage.getItem(THEME_KEY) || (prefersDark ? 'dark' : 'light')

const board = createQuickdraw({
  container: document.getElementById('board'),
  theme,
  grid: 'dots',
})

const { editor } = board
const { store } = editor

// Restore last session's board; loading as 'remote' keeps it out of undo.
try {
  const saved = localStorage.getItem(DOC_KEY)
  if (saved) {
    store.loadSnapshot(JSON.parse(saved), 'remote')
    editor.fitContent()
  }
} catch {
  // A corrupt document shouldn't brick the app — start fresh.
  localStorage.removeItem(DOC_KEY)
}

let saveTimer
store.listen(() => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(DOC_KEY, JSON.stringify(store.getSnapshot()))
    } catch {
      // Quota exceeded (huge pasted images) — keep drawing, skip the save.
    }
  }, 400)
})

// Remember the theme across visits; the badge follows the board's colors.
const badge = document.getElementById('badge')
const syncTheme = () => {
  localStorage.setItem(THEME_KEY, editor.theme.id)
  badge.classList.toggle('dark', editor.theme.id === 'dark')
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', editor.theme.id === 'dark' ? '#1e1e1c' : '#faf8f4')
}
syncTheme()
editor.on('theme', syncTheme)

// Warn before leaving mid-save (the debounce window is short, but honest).
window.addEventListener('beforeunload', () => {
  clearTimeout(saveTimer)
  try {
    localStorage.setItem(DOC_KEY, JSON.stringify(store.getSnapshot()))
  } catch {}
})

window.board = board // devtools access, same as the examples
