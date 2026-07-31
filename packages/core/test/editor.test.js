// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Editor, TOOLS } from '../src/editor.js'
import { createQuickdraw } from '../src/index.js'

// Fake pointer events fed straight to the editor's handlers. The container
// sits at (0,0) in jsdom, so clientX/Y are screen coords directly.
let pid = 1
const ev = (x, y, over = {}) => ({
  pointerId: over.pointerId ?? pid,
  pointerType: 'mouse',
  clientX: x,
  clientY: y,
  button: 0,
  pressure: 0.5,
  shiftKey: false,
  altKey: false,
  metaKey: false,
  ctrlKey: false,
  target: null, // patched to editor.canvas below
  preventDefault() {},
  stopPropagation() {},
  ...over,
})

function drag(editor, pts, over = {}) {
  pid++
  const [x0, y0] = pts[0]
  editor._pointerDown({ ...ev(x0, y0, over), target: editor.canvas })
  for (const [x, y] of pts.slice(1)) editor._pointerMove({ ...ev(x, y, over), target: editor.canvas })
  const [xn, yn] = pts[pts.length - 1]
  editor._pointerUp({ ...ev(xn, yn, over), target: editor.canvas })
}

let container, editor

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  editor = new Editor({ container })
})

afterEach(() => {
  editor.destroy()
  container.remove()
})

describe('setup', () => {
  it('mounts canvases and starts on select', () => {
    expect(container.querySelectorAll('canvas').length).toBe(2)
    expect(editor.tool).toBe('select')
    expect(TOOLS).toContain('draw')
  })

  it('camera math round-trips', () => {
    editor.setCamera({ x: 50, y: -20, z: 2 })
    const p = editor.screenToPage(100, 100)
    const s = editor.pageToScreen(p.x, p.y)
    expect(s.x).toBeCloseTo(100)
    expect(s.y).toBeCloseTo(100)
  })

  it('zoomAt keeps the anchor point fixed', () => {
    const before = editor.screenToPage(80, 60)
    editor.zoomAt(80, 60, 2)
    const after = editor.screenToPage(80, 60)
    expect(after.x).toBeCloseTo(before.x)
    expect(after.y).toBeCloseTo(before.y)
    expect(editor.camera.z).toBeCloseTo(2)
  })
})

describe('deferred fit', () => {
  it('fitContent before layout waits for real dimensions instead of clamping to min zoom', () => {
    editor.setTool('geo')
    drag(editor, [[10, 10], [110, 60]])
    // jsdom containers measure 0x0 — exactly the "no layout yet" case
    editor.fitContent()
    expect(editor.camera.z).toBe(1) // untouched, not clamped to 0.05

    // layout arrives: the container now measures 800x600 and render() replays the fit
    Object.defineProperty(container, 'clientWidth', { value: 800, configurable: true })
    Object.defineProperty(container, 'clientHeight', { value: 600, configurable: true })
    editor.render()
    expect(editor.camera.z).toBeGreaterThan(0.5)
    // the shape's center lands mid-view
    const c = editor.pageToScreen(60, 35)
    expect(c.x).toBeCloseTo(400, 0)
    expect(c.y).toBeCloseTo(300, 0)
  })
})

describe('drawing', () => {
  it('a drag with the draw tool creates one stroke, undoable as one step', () => {
    editor.setTool('draw')
    drag(editor, [[10, 10], [20, 15], [40, 30], [60, 50]])
    const shapes = editor.store.shapes()
    expect(shapes.length).toBe(1)
    expect(shapes[0].type).toBe('draw')
    expect(shapes[0].props.done).toBe(true)
    expect(shapes[0].props.pts.length).toBeGreaterThanOrEqual(6)
    expect(editor.store.undos.length).toBe(1)
    editor.store.undo()
    expect(editor.store.shapes().length).toBe(0)
  })

  it('the highlighter makes highlight shapes that sort under ink', () => {
    editor.setTool('draw')
    drag(editor, [[10, 10], [60, 60]])
    editor.setTool('highlight')
    drag(editor, [[10, 20], [60, 70]])
    const sorted = editor.shapesSorted()
    expect(sorted[0].type).toBe('highlight') // renders first, under the ink
    expect(sorted[1].type).toBe('draw')
  })
})

describe('geo / line / arrow', () => {
  it('dragging geo creates a rect of the dragged size and selects it', () => {
    editor.setTool('geo')
    drag(editor, [[10, 10], [110, 60]])
    const [s] = editor.store.shapes()
    expect(s.type).toBe('geo')
    expect(s.props.w).toBeCloseTo(100)
    expect(s.props.h).toBeCloseTo(50)
    expect(editor.tool).toBe('select') // tool returns to select
    expect(editor.selection.has(s.id)).toBe(true)
  })

  it('a click (no drag) drops a ready-made 160x160 shape', () => {
    editor.setTool('geo')
    drag(editor, [[50, 50]])
    const [s] = editor.store.shapes()
    expect(s.props.w).toBe(160)
    expect(s.props.h).toBe(160)
  })

  it('arrow drag sets dx/dy; tiny arrows evaporate', () => {
    editor.setTool('arrow')
    drag(editor, [[10, 10], [110, 40]])
    const [s] = editor.store.shapes()
    expect(s.type).toBe('arrow')
    expect(s.props.dx).toBeCloseTo(100)
    expect(s.props.dy).toBeCloseTo(30)

    editor.setTool('arrow')
    drag(editor, [[200, 200], [200.5, 200.5]])
    expect(editor.store.shapes().length).toBe(1) // the tiny one is gone
  })

  it('shift snaps lines to 15-degree steps', () => {
    editor.setTool('line')
    pid++
    editor._pointerDown({ ...ev(0, 0), target: editor.canvas })
    editor._pointerMove({ ...ev(100, 8, { shiftKey: true }), target: editor.canvas })
    const [s] = editor.store.shapes()
    expect(s.props.dy).toBeCloseTo(0) // snapped flat
    editor._pointerUp({ ...ev(100, 8, { shiftKey: true }), target: editor.canvas })
  })
})

describe('selection & transforms', () => {
  const makeRect = (x, y, w = 60, h = 40) => {
    editor.setTool('geo')
    drag(editor, [[x, y], [x + w, y + h]])
    return editor.store.shapes()[editor.store.shapes().length - 1]
  }

  it('click selects, click empty clears, shift-click toggles', () => {
    const a = makeRect(10, 10)
    const b = makeRect(200, 10)
    // plain click on a's edge
    drag(editor, [[10, 10]])
    expect([...editor.selection]).toEqual([a.id])
    // shift-click b adds
    drag(editor, [[200, 10]], { shiftKey: true })
    expect(editor.selection.size).toBe(2)
    // click empty space clears
    drag(editor, [[400, 400]])
    expect(editor.selection.size).toBe(0)
    expect(b.id).toBeTruthy()
  })

  it('marquee selects grazed shapes', () => {
    const a = makeRect(20, 20)
    makeRect(300, 300)
    drag(editor, [[0, 0], [120, 120]])
    expect([...editor.selection]).toEqual([a.id])
  })

  it('dragging a selected shape translates it (one undo step)', () => {
    const a = makeRect(10, 10)
    editor.setSelection([a.id])
    const undosBefore = editor.store.undos.length
    // press on the top edge but away from resize handles, drag +40/+50
    drag(editor, [[30, 14], [70, 64]])
    const moved = editor.store.get(a.id)
    expect(moved.x).toBeCloseTo(a.x + 40)
    expect(moved.y).toBeCloseTo(a.y + 50)
    expect(editor.store.undos.length).toBe(undosBefore + 1)
  })

  it('deleteSelection / selectAll / duplicateSelection', () => {
    makeRect(10, 10)
    makeRect(100, 10)
    editor.selectAll()
    expect(editor.selection.size).toBe(2)
    editor.duplicateSelection()
    expect(editor.store.shapes().length).toBe(4)
    expect(editor.selection.size).toBe(2) // the copies
    editor.selectAll()
    editor.deleteSelection()
    expect(editor.store.shapes().length).toBe(0)
  })

  it('bringToFront / sendToBack reorder z', () => {
    const a = makeRect(10, 10)
    const b = makeRect(20, 20)
    expect(b.z).toBeGreaterThan(a.z)
    editor.setSelection([a.id])
    editor.bringToFront()
    expect(editor.store.get(a.id).z).toBeGreaterThan(editor.store.get(b.id).z)
    editor.sendToBack()
    expect(editor.store.get(a.id).z).toBeLessThan(editor.store.get(b.id).z)
  })

  it('eraser removes everything it swept over in one undo step', () => {
    makeRect(10, 10)
    makeRect(100, 100)
    editor.setTool('eraser')
    drag(editor, [[10, 10], [100, 100]]) // sweep corner to corner
    expect(editor.store.shapes().length).toBe(0)
    editor.store.undo()
    expect(editor.store.shapes().length).toBe(2)
  })
})

describe('text & notes', () => {
  it('placing text opens a textarea; typing commits; empty evaporates', () => {
    editor.setTool('text')
    drag(editor, [[50, 50]])
    const ta = container.querySelector('textarea.qd-text-edit')
    expect(ta).toBeTruthy()
    ta.value = 'hello world'
    ta.dispatchEvent(new window.Event('input'))
    editor._commitText()
    const [s] = editor.store.shapes()
    expect(s.type).toBe('text')
    expect(s.props.text).toBe('hello world')

    // empty text evaporates on commit
    editor.setTool('text')
    drag(editor, [[200, 200]])
    editor._commitText()
    expect(editor.store.shapes().length).toBe(1)
  })

  it('notes get the note default color when pen is black', () => {
    editor.setTool('note')
    drag(editor, [[50, 50]])
    const note = editor.store.shapes().find((s) => s.type === 'note')
    expect(note.props.color).toBe('yellow')
    const ta = container.querySelector('textarea.qd-text-edit')
    ta.value = 'sticky'
    ta.dispatchEvent(new window.Event('input'))
    editor._commitText()
    expect(editor.store.get(note.id).props.text).toBe('sticky')
  })
})

describe('styles', () => {
  it('setStyle updates the pen and any applicable selection', () => {
    editor.setTool('geo')
    drag(editor, [[10, 10], [80, 80]])
    const [s] = editor.store.shapes()
    editor.setSelection([s.id])
    editor.setStyle('color', 'red')
    editor.setStyle('fill', 'solid')
    const after = editor.store.get(s.id)
    expect(after.props.color).toBe('red')
    expect(after.props.fill).toBe('solid')
    expect(editor.styles.color).toBe('red')
  })

  it('currentStyles reports mixed values as null', () => {
    editor.setTool('geo')
    drag(editor, [[10, 10], [80, 80]])
    editor.setTool('geo')
    drag(editor, [[100, 10], [180, 80]])
    const [a, b] = editor.store.shapes()
    editor.store.update(a.id, { props: { color: 'blue' } })
    editor.store.update(b.id, { props: { color: 'green' } })
    editor.setSelection([a.id, b.id])
    expect(editor.currentStyles().color).toBeNull()
  })
})

describe('readonly & theme', () => {
  it('readonly blocks input', () => {
    editor.setReadonly(true)
    editor.setTool('draw')
    drag(editor, [[10, 10], [60, 60]])
    expect(editor.store.shapes().length).toBe(0)
  })

  it('theme switches live and reflects on the container', () => {
    editor.setTheme('dark')
    expect(editor.theme.id).toBe('dark')
    expect(container.dataset.qdTheme).toBe('dark')
  })
})

describe('laser', () => {
  it('scribbles are ephemeral (never in the store)', () => {
    editor.setTool('laser')
    drag(editor, [[10, 10], [50, 50], [90, 30]])
    expect(editor.store.shapes().length).toBe(0)
    expect(editor.getScribbles().length).toBe(1)
    expect(editor.getScribbles()[0].points.length).toBe(3)
  })
})

describe('export', () => {
  it('exportImage yields a blob for a non-empty board, null when empty', async () => {
    expect(await editor.exportImage()).toBeNull()
    editor.setTool('geo')
    drag(editor, [[10, 10], [80, 80]])
    const blob = await editor.exportImage({ background: true, scale: 2 })
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/png')
  })
})

describe('events & lifecycle', () => {
  it('emits change/selection/tool events and unsubscribes cleanly', () => {
    const changes = vi.fn(), sel = vi.fn(), tool = vi.fn()
    const off = editor.on('change', changes)
    editor.on('selection', sel)
    editor.on('tool', tool)
    editor.setTool('geo')
    drag(editor, [[10, 10], [80, 80]])
    expect(changes).toHaveBeenCalled()
    expect(sel).toHaveBeenCalled()
    expect(tool).toHaveBeenCalled()
    const n = changes.mock.calls.length
    off()
    editor.store.undo()
    expect(changes.mock.calls.length).toBe(n)
  })

  it('destroy removes canvases and stops listening', () => {
    const c2 = document.createElement('div')
    document.body.appendChild(c2)
    const board = createQuickdraw({ container: c2 })
    expect(c2.querySelector('.qd-dock')).toBeTruthy()
    board.destroy()
    expect(c2.querySelector('canvas')).toBeNull()
    expect(c2.querySelector('.qd-dock')).toBeNull()
    c2.remove()
  })
})

describe('createQuickdraw UI', () => {
  it('builds the dock with tool buttons that switch tools', () => {
    const c2 = document.createElement('div')
    document.body.appendChild(c2)
    const board = createQuickdraw({ container: c2 })
    const drawBtn = c2.querySelector('.qd-dock button[data-name="draw"]')
    expect(drawBtn).toBeTruthy()
    drawBtn.click()
    expect(board.editor.tool).toBe('draw')
    expect(drawBtn.classList.contains('on')).toBe(true)
    board.destroy()
    c2.remove()
  })

  it('undo/redo buttons track history through full gestures', () => {
    const c2 = document.createElement('div')
    document.body.appendChild(c2)
    const board = createQuickdraw({ container: c2 })
    const btn = (n) => c2.querySelector(`.qd-dock button[data-name="${n}"]`)
    expect(btn('undo').disabled).toBe(true)

    board.editor.setTool('draw')
    drag(board.editor, [[10, 10], [40, 40], [80, 60]])
    // the stroke's batch closed: undo must light up without any other event
    expect(btn('undo').disabled).toBe(false)
    expect(btn('redo').disabled).toBe(true)

    btn('undo').click()
    expect(board.editor.store.shapes().length).toBe(0)
    expect(btn('redo').disabled).toBe(false)
    btn('redo').click()
    expect(board.editor.store.shapes().length).toBe(1)
    expect(btn('undo').disabled).toBe(false)
    expect(btn('redo').disabled).toBe(true)
    board.destroy()
    c2.remove()
  })

  it('hideUi hides the chrome; readonly does too', () => {
    const c2 = document.createElement('div')
    document.body.appendChild(c2)
    const board = createQuickdraw({ container: c2, hideUi: true })
    expect(c2.querySelector('.qd-ui').classList.contains('qd-hidden')).toBe(true)
    board.destroy()
    c2.remove()
  })
})
