---
layout: ../../layouts/Article.astro
title: "Open-source tldraw alternatives in 2026"
description: "tldraw's SDK needs a paid license to remove its watermark. Here are the genuinely open-source whiteboard libraries — Excalidraw, Quickdraw, and the DIY route — compared honestly."
date: 2026-08-01
---

tldraw is probably the best-known infinite-canvas SDK for React, and it's
genuinely good software. It's also not open source in the way many developers
assume: since the 3.x release, production use requires either a
["Made with tldraw" watermark on the canvas or a paid business license](https://tldraw.dev/community/license),
with the startup tier publicly listed in the thousands of dollars per year.

That's a legitimate business model. But if you came here searching for an
*alternative*, you probably want one of two things: a genuinely free license,
or a library that fits a stack tldraw doesn't cover (plain JavaScript, React
Native). Here's the honest landscape.

## What "open source" actually means here

Before comparing, three license situations get conflated:

- **MIT / Apache** — use it commercially, modify it, no watermark, no fees,
  irrevocably. This is what most people mean by open source.
- **Source-available with a watermark clause** — you can read and modify the
  code, but shipping to production carries conditions. tldraw 3.x is here.
- **Copyleft (GPL/AGPL)** — free, but with obligations that many commercial
  teams can't accept for an embedded SDK.

Everything below is MIT unless noted.

## Excalidraw

[Excalidraw](https://github.com/excalidraw/excalidraw) is the heavyweight
MIT-licensed option: a hugely popular hand-drawn-style whiteboard with an
embeddable React component (`@excalidraw/excalidraw`). It's mature, actively
maintained, and battle-tested at enormous scale.

Where it fits less well: it's React-only, the embed brings Excalidraw's own
look and UX (which is charming but distinctive), and the component is a fairly
large dependency. Collaboration exists via the separate `excalidraw-room`
server. If you want "the Excalidraw experience inside my app," it's an
excellent choice.

## Quickdraw

[Quickdraw](https://tryquickdraw.com) — this project — is an MIT-licensed
whiteboard SDK built to be *embedded*: the core engine is plain ESM with zero
runtime dependencies (~46 kB unpacked), and the same engine ships as three
packages:

- `@tryquickdraw/core` — any web page, no framework, no build step
- `@tryquickdraw/react` — a `<Quickdraw />` component with an imperative ref
- `@tryquickdraw/react-native` — a WebView component with a typed bridge,
  Apple Pencil pressure, and palm rejection

You get pressure-sensitive ink, shapes with a hand-drawn wobble, arrows,
sticky notes, images, a laser pointer, per-gesture undo, light/dark themes,
grids, and PNG export out of the box — plus a diff-emitting store designed for
persistence and real-time sync (every change is a JSON-safe diff you can ship
over any transport).

Where it fits less well: it's young. Excalidraw and tldraw have years of
production hardening and much bigger communities. If you need rich text,
frames, or a first-party sync server today, the older projects are ahead.

## The DIY route: perfect-freehand + your own canvas

If you only need *drawing* — not selection, shapes, undo, export, and the
other 80% — [perfect-freehand](https://github.com/steveruizok/perfect-freehand)
(MIT, by tldraw's author) turns pointer input into beautiful pressure-sensitive
stroke outlines, and you render them yourself. Many teams start here and then
discover the whiteboard iceberg: hit-testing, camera math, undo semantics,
touch gestures, palm rejection. Budget accordingly.

## Quick comparison

| | Quickdraw | Excalidraw | tldraw SDK |
|---|---|---|---|
| License | MIT | MIT | Custom (watermark unless paid) |
| React | Yes | Yes | Yes |
| No-framework JS | **Yes** | No | No |
| React Native | **Yes** | No | No |
| Core dependencies | **Zero** | Several | Many |
| Community size | Young | Very large | Large |
| First-party sync server | Not yet | excalidraw-room | Paid (tldraw sync) |

## Choosing

- **You want maximum maturity and MIT:** Excalidraw.
- **You want a lightweight embed, plain-JS support, or React Native:**
  Quickdraw.
- **You only need ink and love building canvases:** perfect-freehand.
- **The license cost is fine for your business:** tldraw remains excellent.

Quickdraw is [open to contributions](https://github.com/nmndwivedi/quickdraw)
— if the missing feature that sent you back to a paid SDK is on our
[roadmap](https://github.com/nmndwivedi/quickdraw/issues/1), tell us or build
it with us.
