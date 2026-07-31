import * as React from 'react'
import type {
  ColorId, DashId, Diff, DiffSource, FillId, FontId, SizeId, Snapshot, Styles, ThemeId, ToolId,
} from '@tryquickdraw/core'

/** The self-contained HTML page the WebView renders (engine + CSS inlined). */
export const BOARD_HTML: string

export function encodeDispatch(msg: object): string
export function createBridge(
  send: (js: string) => void,
  opts?: { timeout?: number }
): {
  post(msg: object): void
  request<T = any>(msg: object): Promise<T>
  settle(id: string, value: any): boolean
  dispose(): void
}

export interface QuickdrawRef {
  loadSnapshot(snapshot: Snapshot, fit?: boolean): void
  applyDiff(diff: Diff): void
  setTool(tool: ToolId): void
  setStyle(key: keyof Styles, value: ColorId | SizeId | DashId | FillId | FontId): void
  undo(): void
  redo(): void
  clear(): void
  fitContent(animate?: number): void
  getSnapshot(): Promise<Snapshot>
  exportPng(opts?: { background?: boolean; scale?: number; margin?: number }): Promise<string | null>
}

export interface QuickdrawProps {
  theme?: ThemeId | string
  readonly?: boolean
  hideUi?: boolean
  snapshot?: Snapshot
  styles?: Partial<Styles>
  onReady?: () => void
  onChange?: (diff: Diff, source: DiffSource) => void
  onSelectionChange?: (ids: string[]) => void
  /** Toolbar PNG export handed to you as a data URL. */
  onSave?: (dataUrl: string, background: boolean) => void
  onError?: (message: string) => void
  style?: any
  /** Extra props spread onto the underlying react-native-webview WebView. */
  webviewProps?: Record<string, any>
}

/** A complete whiteboard in a React Native view (WebView-based). */
export const Quickdraw: React.ForwardRefExoticComponent<
  QuickdrawProps & React.RefAttributes<QuickdrawRef>
>
