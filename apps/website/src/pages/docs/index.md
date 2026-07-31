---
layout: ../../layouts/Article.astro
title: "Quickdraw documentation"
description: "Install Quickdraw, embed a whiteboard in React or plain JavaScript, persist boards as JSON, wire up real-time sync, and go headless. The full guide."
---

Quickdraw is an MIT-licensed infinite-canvas whiteboard SDK. This page takes
you from install to a persisted, sync-ready board. For deeper API details, the
[README](https://github.com/nmndwivedi/quickdraw#readme) and each package's
typed declarations are the source of truth.

## Install

Pick the package for your stack — they share one engine:

```bash
npm install @tryquickdraw/react          # React
npm install @tryquickdraw/core           # any web page, no framework
npm install @tryquickdraw/react-native react-native-webview   # RN / Expo
```

## Your first board (React)

```jsx
import { Quickdraw } from '@tryquickdraw/react'
import '@tryquickdraw/core/quickdraw.css'

export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Quickdraw theme="light" grid="lines" />
    </div>
  )
}
```

The component fills its container, so give the container real dimensions.
`theme` is `"light"` or `"dark"`; `grid` is `"none"`, `"lines"`, or `"dots"` —
users can also switch both from the board's ⋮ menu.

## Your first board (plain JS)

The core is dependency-free ESM — it runs in any modern browser without a
build step:

```js
import { createQuickdraw } from '@tryquickdraw/core'
import '@tryquickdraw/core/quickdraw.css'

const board = createQuickdraw({
  container: document.getElementById('board'),
  theme: 'light',
  grid: 'dots',
})
```

`createQuickdraw` returns `{ editor, ui, destroy }`. Everything below applies
to both React (via `ref.current.editor`) and plain JS (via `board.editor`).

## Persistence

The whole document round-trips as plain JSON:

```js
// save (debounced on change)
board.editor.store.listen(() => {
  localStorage.setItem('doc', JSON.stringify(board.editor.store.getSnapshot()))
})

// restore
const saved = localStorage.getItem('doc')
if (saved) {
  board.editor.store.loadSnapshot(JSON.parse(saved), 'remote')
  board.editor.fitContent()
}
```

Loading with source `'remote'` keeps the restore out of the user's undo
history.

## Real-time sync

Every change emits a JSON-safe diff:
`{ added, removed, updated: { [id]: [from, to] } }`. A complete sync client is
four lines:

```js
store.listen((diff) => socket.send(JSON.stringify(diff)), { source: 'user' })
socket.onmessage = (e) => store.applyDiff(JSON.parse(e.data), 'remote')
```

Remote diffs never enter local undo history, so collaborative undo behaves the
way users expect. Any transport works — WebSocket, WebRTC, BroadcastChannel.

## Imperative control & going headless

```js
const { editor } = board
editor.setTool('draw')        // 'select' | 'hand' | 'draw' | 'highlight' |
                              // 'eraser' | 'laser' | 'arrow' | 'line' |
                              // 'geo' | 'text' | 'note'
editor.setTheme('dark')
editor.fitContent()
editor.store.undo()
editor.store.redo()
```

Pass `hideUi: true` (or the `hideUi` prop in React) to render just the canvas
and build your own toolbar from these calls. `readonly: true` gives you a
view-only board.

## Export

The built-in toolbar exports PNG (whole board or selection, paper or
transparent). Intercept it with `onSave` to upload instead of download:

```jsx
<Quickdraw onSave={(blob) => upload(blob)} />
```

## React Native

```jsx
import { Quickdraw } from '@tryquickdraw/react-native'

<Quickdraw
  ref={board}
  theme="dark"
  onChange={(diff) => sync(diff)}
  style={{ flex: 1 }}
/>
```

The engine ships inside the package as a single self-contained HTML page — no
network needed, works offline. Apple Pencil pressure and palm rejection are
included, and the bridge is fully typed:

```js
const snapshot = await board.current.getSnapshot()
const png = await board.current.exportPng({ scale: 2 })
```

## Keyboard map

`V` select · `H` hand · `D` draw · `I` highlight · `E` eraser · `K` laser ·
`A` arrow · `L` line · `R`/`O` shapes · `T` text · `N` note · `⌘Z`/`⇧⌘Z`
undo/redo · `⌘C/X/V/D` clipboard · `]`/`[` reorder · arrows nudge · `⇧1` zoom
to fit.

## Where next

- [The GitHub repo](https://github.com/nmndwivedi/quickdraw) — source, issues, discussions
- [Examples](https://github.com/nmndwivedi/quickdraw/tree/main/examples) — vanilla and React playgrounds
- [Blog](/blog/) — guides and comparisons
