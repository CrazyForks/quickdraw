# Changelog

All notable changes to the `@quickdrawjs/*` packages are documented here.
The project follows [semver](https://semver.org); the three packages are
versioned in lockstep.

## 0.1.0 — 2026-08-01

First public release.

- `@quickdrawjs/core` — the framework-free engine: pressure-sensitive
  freehand ink, highlighter, shapes with hand-drawn wobble, arrows with
  draggable bend, text, sticky notes, images, laser pointer, selection with
  move/resize/rotate, infinite canvas with pan/zoom/pinch, palm rejection,
  per-gesture undo/redo, light & dark themes, ruled/dotted grid backdrops,
  PNG export, responsive floating toolbar, and a diff-emitting store built
  for persistence and real-time sync. Zero runtime dependencies.
- `@quickdrawjs/react` — `<Quickdraw />` component with `snapshot`,
  `onChange`, `onSave`, `autoFit`, and an imperative ref to the editor.
- `@quickdrawjs/react-native` — WebView-based component with a typed bridge:
  `getSnapshot()`, `exportPng()`, theme control, Apple Pencil pressure, and
  palm rejection. Ships a self-contained HTML bundle; works offline.
