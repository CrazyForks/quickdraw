# Quickdraw

[![CI](https://github.com/nmndwivedi/quickdraw/actions/workflows/ci.yml/badge.svg)](https://github.com/nmndwivedi/quickdraw/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@tryquickdraw/core?label=%40tryquickdraw%2Fcore)](https://www.npmjs.com/package/@tryquickdraw/core)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**The MIT-licensed infinite-canvas whiteboard SDK.** Drop a complete,
polished drawing surface into your React, React Native, or plain-JS app —
free for any use, including commercial products, forever. An open-source
alternative to tldraw with no watermark and no license fee.

**[Website](https://tryquickdraw.vercel.app)** · **[Try the app](https://tryquickdraw-app.vercel.app)** · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)

Quickdraw exists because embedding a whiteboard shouldn't cost thousands of
dollars a year. Popular canvas SDKs require a paid business license to remove
their watermark from production apps. Quickdraw is MIT: no watermark, no
license key, no strings.

## What you get

A complete whiteboard, not a toolkit you assemble:

- **Pressure ink** — a freehand pen whose width breathes with stylus pressure,
  or with velocity for mouse users; strokes taper like a real pen
- **Highlighter** that soaks into the paper (and glows on dark boards)
- **Shapes** — rectangle, ellipse, triangle, diamond, hexagon, star — with a
  seeded hand-drawn wobble, four fill styles, and editable labels
- **Arrows** with draggable bend, lines, text, sticky notes
- **Images** — paste, drag-drop, or pick; auto-downscaled and stored in-document
- **Laser pointer** for presenting (ephemeral, never saved)
- **Selection** — click, shift-click, marquee; move, resize, rotate, duplicate,
  reorder; full keyboard nudging
- **Infinite canvas** — pan, wheel zoom, two-finger pinch, zoom-to-fit
- **Palm rejection** — once a stylus is seen, fingers steer the camera and the
  pen draws
- **Undo/redo** — one entry per gesture, however many events it took
- **Light & dark themes**, twelve named colors that resolve per theme, and a
  theme switch built into the board menu
- **Grid backdrops** — ruled lines or dotted intersections, spacing that adapts
  to the zoom and fades in rather than popping
- **PNG export** — whole board or selection, on paper or transparent
- **A responsive floating toolbar** that sheds tools gracefully as the frame
  narrows — or hide it and build your own from the headless API
- **Real-time sync built into the data model** — every change emits a
  JSON-safe diff you can ship over any transport

Zero runtime dependencies. The core is plain ESM that runs in any modern
browser without a build step.

## Packages

| Package | For | |
| --- | --- | --- |
| [`@tryquickdraw/core`](packages/core) | Any web page or framework | framework-free engine + toolbar |
| [`@tryquickdraw/react`](packages/react) | React apps | `<Quickdraw />` component + hooks |
| [`@tryquickdraw/react-native`](packages/react-native) | React Native / Expo apps | WebView component + typed bridge |

## Quick start — React

```bash
npm install @tryquickdraw/react
```

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

Persistence, imperative control, custom chrome:

```jsx
const ref = useRef(null)

<Quickdraw
  ref={ref}
  snapshot={saved}                          // load a serialized document
  autoFit                                   // fit content on mount/resize
  onChange={(diff, source, editor) =>       // every document change
    save(editor.store.getSnapshot())}
  onSave={(blob) => upload(blob)}           // intercept toolbar PNG export
/>

ref.current.editor.setTool('draw')
ref.current.editor.store.undo()
```

## Quick start — plain JS

```bash
npm install @tryquickdraw/core
```

```js
import { createQuickdraw } from '@tryquickdraw/core'
import '@tryquickdraw/core/quickdraw.css'

const board = createQuickdraw({ container: document.getElementById('board') })
board.editor.store.listen((diff) => console.log('changed', diff))
```

## Quick start — React Native

```bash
npm install @tryquickdraw/react-native react-native-webview
```

```jsx
import { Quickdraw } from '@tryquickdraw/react-native'

<Quickdraw
  ref={board}
  theme="dark"
  onChange={(diff) => sync(diff)}
  style={{ flex: 1 }}
/>

// const snapshot = await board.current.getSnapshot()
// const png = await board.current.exportPng({ scale: 2 })
```

The engine ships inside the package as a single self-contained HTML string —
no network, works offline, Apple Pencil pressure and palm rejection included.

## The data model

The document is a flat map of immutable records. Every mutation happens in a
transaction and emits a diff:

```js
{ added: { [id]: record }, removed: { [id]: record }, updated: { [id]: [from, to] } }
```

That one shape powers everything:

- **Persistence** — `store.getSnapshot()` / `store.loadSnapshot(snap)` are
  plain JSON round-trips
- **Sync** — ship user diffs to peers, `store.applyDiff(diff, 'remote')` on
  arrival; remote diffs never pollute local undo history, so collaborative
  undo behaves
- **History** — undo entries are diffs, composed per gesture; `invertDiff` and
  `composeDiff` are exported
- **Audit / recording** — log the diff stream and you can replay a drawing
  stroke by stroke

```js
// a complete sync client
store.listen((diff) => socket.send(JSON.stringify(diff)), { source: 'user' })
socket.onmessage = (e) => store.applyDiff(JSON.parse(e.data), 'remote')
```

## Keyboard shortcuts

| | |
| --- | --- |
| `V` / `1` | Select |
| `H` | Hand (or hold `Space`) |
| `D` / `P` / `B` | Draw |
| `I` | Highlight |
| `E` | Eraser |
| `K` | Laser |
| `A` / `L` | Arrow / Line |
| `G`, `R`, `O` | Shape / rectangle / ellipse |
| `T` / `N` | Text / sticky note |
| `⌘Z` / `⇧⌘Z` | Undo / redo |
| `⌘A` `⌘C` `⌘X` `⌘V` `⌘D` | Select all, copy, cut, paste, duplicate |
| `]` / `[` | Bring to front / send to back |
| Arrows (+`Shift`) | Nudge selection |
| `⇧1` / `⇧0` | Zoom to fit / reset zoom |
| `⌘+` / `⌘−` | Zoom in / out |
| `⌫` / `⇧⌘⌫` | Delete selection / clear the board (undoable) |
| `Enter` / `Esc` | Edit text / done |

## Repository

```
packages/core          @tryquickdraw/core — the engine (plain ESM, zero deps)
packages/react         @tryquickdraw/react
packages/react-native  @tryquickdraw/react-native
examples/vanilla       no-build-step example (open via any static server)
examples/react-demo    vite playground (npm run dev)
```

Development:

```bash
npm install       # workspace install
npm test          # vitest — engine, React bindings, RN bridge
npm run dev       # react demo at localhost:5173
npm run build     # bundle the RN WebView page
npm run typecheck # validate the published type declarations
```

## Contributing

Quickdraw is open to contributions from everyone — bug reports, features,
docs, examples. Start with [CONTRIBUTING.md](CONTRIBUTING.md), browse
[`good first issue`](https://github.com/nmndwivedi/quickdraw/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22),
or open a [discussion](https://github.com/nmndwivedi/quickdraw/discussions)
if you're not sure where a change belongs. We follow the
[Contributor Covenant](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE). Use it, ship it, sell what you build with it.
