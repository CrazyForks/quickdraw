---
layout: ../../layouts/Article.astro
title: "Open-source tldraw alternatives in 2026"
description: "tldraw's SDK requires a paid business license for some production use. Here are the genuinely MIT-licensed whiteboard libraries — Excalidraw, Quickdraw, and the DIY route — compared."
date: 2026-08-01
---

tldraw is probably the best-known infinite-canvas SDK for React, and it's
good software. It's also not open source in the way many developers assume:
since the 3.x release, production use comes with
[license conditions](https://tldraw.dev/community/license), and removing the
built-in attribution requires a paid business license — the startup tier is
publicly listed in the thousands of dollars per year.

That's a legitimate business model. But if you searched for an *alternative*,
you probably want one of two things: a genuinely free license, or a library
that fits a stack tldraw doesn't cover (plain JavaScript, React Native).
Here's the landscape.

## What "open source" means here

Three license situations get conflated:

- **MIT / Apache** — use it commercially, modify it, no fees, irrevocably.
  This is what most people mean by open source.
- **Source-available with conditions** — you can read and modify the code,
  but shipping to production carries terms. tldraw 3.x is here.
- **Copyleft (GPL/AGPL)** — free, but with obligations many commercial teams
  can't accept for an embedded SDK.

Everything below is MIT.

## Excalidraw

[Excalidraw](https://github.com/excalidraw/excalidraw) is the heavyweight
MIT option: a hugely popular hand-drawn-style whiteboard with an embeddable
React component (`@excalidraw/excalidraw`). It's mature, actively
maintained, and battle-tested at scale.

Where it fits less well: it's React-only, the embed brings Excalidraw's own
look and UX, and the component is a fairly large dependency. Collaboration
runs through the separate `excalidraw-room` server. If you want "the
Excalidraw experience inside my app," it's an excellent choice.

## Quickdraw

[Quickdraw](https://tryquickdraw.com) — this project — is an MIT-licensed
whiteboard SDK built to be embedded. The core engine is plain ESM with zero
runtime dependencies (~46 kB unpacked), and the same engine ships as three
packages:

- `@tryquickdraw/core` — any web page, no framework, no build step
- `@tryquickdraw/react` — a `<Quickdraw />` component with an imperative ref
- `@tryquickdraw/react-native` — a WebView component with a typed bridge,
  Apple Pencil pressure, and palm rejection

You get pressure-sensitive ink, shapes with a hand-drawn wobble, arrows,
sticky notes, images, a laser pointer, per-gesture undo, light and dark
themes, grids, and PNG export — plus a diff-emitting store designed for
persistence and real-time sync. A small "Quickdraw" mark sits in the board's
corner by default; unlike tldraw's attribution, turning it off is a boolean
(`watermark: false`), not a paid tier.

Where it fits less well: it's young. Excalidraw and tldraw have years of
production hardening and much bigger communities. If you need rich text,
frames, or a first-party sync server today, the older projects are ahead.

## The DIY route: perfect-freehand + your own canvas

If you only need *drawing* — not selection, shapes, undo, and export —
[perfect-freehand](https://github.com/steveruizok/perfect-freehand) (MIT, by
tldraw's author) turns pointer input into pressure-sensitive stroke
outlines, and you render them yourself. Many teams start here and then meet
the rest of the iceberg: hit-testing, camera math, undo semantics, touch
gestures, palm rejection. Budget for that before you commit.

## Quick comparison

| | Quickdraw | Excalidraw | tldraw SDK |
|---|---|---|---|
| License | MIT | MIT | Custom |
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
- **You only need ink and enjoy building canvases:** perfect-freehand.
- **The license cost is fine for your business:** tldraw remains excellent.

Quickdraw is [open to contributions](https://github.com/nmndwivedi/quickdraw).
If the missing feature that sent you back to a paid SDK is on the
[roadmap](https://github.com/nmndwivedi/quickdraw/issues/1), tell us — or
build it with us.
