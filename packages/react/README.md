# @tryquickdraw/react

React bindings for [Quickdraw](https://tryquickdraw.com) — the MIT-licensed
infinite-canvas whiteboard SDK.

## Install

```bash
npm install @tryquickdraw/react
```

## Quick start

```jsx
import { Quickdraw } from '@tryquickdraw/react'
import '@tryquickdraw/core/quickdraw.css'

export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Quickdraw theme="light" />
    </div>
  )
}
```

That's a complete whiteboard: pen with pressure ink, highlighter, shapes,
arrows, text, sticky notes, images, eraser, laser pointer, selection,
pan/zoom/pinch, undo/redo, PNG export, and a responsive floating toolbar.

## Persistence

```jsx
<Quickdraw
  snapshot={savedSnapshot}
  autoFit
  onChange={(diff, source, editor) => {
    debouncedSave(editor.store.getSnapshot())
  }}
/>
```

## Imperative access

Everything in [`@tryquickdraw/core`](https://www.npmjs.com/package/@tryquickdraw/core)
is re-exported, and the full editor is reachable through a ref or `onMount`:

```jsx
const ref = useRef(null)

<Quickdraw ref={ref} hideUi />
<button onClick={() => ref.current.editor.setTool('draw')}>Pen</button>
<button onClick={() => ref.current.editor.store.undo()}>Undo</button>
```

## Real-time sync

The store emits a JSON-safe diff for every change and can apply diffs from
peers; remote diffs stay out of local undo history.

```jsx
const store = useQuickdrawStore()

useEffect(() => {
  const unsub = store.listen((diff) => socket.send(JSON.stringify(diff)), { source: 'user' })
  socket.onmessage = (e) => store.applyDiff(JSON.parse(e.data), 'remote')
  return unsub
}, [store])

<Quickdraw store={store} />
```

See the [repository README](https://github.com/tryquickdraw/quickdraw) for the
full API.

## License

MIT
