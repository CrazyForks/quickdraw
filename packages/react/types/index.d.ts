import * as React from 'react'
import type {
  Camera, Diff, DiffSource, Editor, BoardUI, Snapshot, Store, Styles, ThemeId,
} from '@tryquickdraw/core'

export * from '@tryquickdraw/core'

export interface QuickdrawRef {
  readonly editor: Editor | null
  readonly ui: BoardUI | null
}

export interface QuickdrawProps {
  /** 'light' | 'dark' — live-switchable. */
  theme?: ThemeId | string
  /** Lock input (also hides the toolbar). */
  readonly?: boolean
  /** Hide the stock toolbar (bring your own chrome). */
  hideUi?: boolean
  /** External Store to render (share one across components/peers). */
  store?: Store
  /** Serialized document loaded on mount (ignored when `store` is given). */
  snapshot?: Snapshot
  /** Initial camera. */
  camera?: Camera
  /** Initial pen styles. */
  styles?: Partial<Styles>
  /** Fit content into view on mount and container resize. */
  autoFit?: boolean
  onMount?: (editor: Editor, ui: BoardUI) => void
  onChange?: (diff: Diff, source: DiffSource, editor: Editor) => void
  onSelectionChange?: (ids: string[], editor: Editor) => void
  /** Intercept toolbar PNG export (default: browser download). */
  onSave?: (blob: Blob, background: boolean) => void
  className?: string
  style?: React.CSSProperties
}

/** A complete whiteboard in a div. */
export const Quickdraw: React.ForwardRefExoticComponent<
  QuickdrawProps & React.RefAttributes<QuickdrawRef>
>

/** A stable Store instance for controlled usage. */
export function useQuickdrawStore(snapshot?: Snapshot): Store
