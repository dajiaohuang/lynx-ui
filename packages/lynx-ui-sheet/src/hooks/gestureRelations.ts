// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Minimal structural shape of a gesture object for relation setup.
 * Avoids importing the full gesture-runtime types (which pull in Lynx runtime).
 */
export interface GestureRelations<TGesture = unknown> {
  waitFor: TGesture[]
  continueWith: TGesture[]
  externalWaitFor: (gesture: TGesture) => unknown
  externalContinueWith: (gesture: TGesture) => unknown
}

/**
 * Set up coordinated gesture relations between the native scroll gesture
 * and the pan (sheet drag) gesture.
 *
 * - `waitFor(pan)`: native waits for pan to fail before activating, so pan
 *   claims direct sheet drags first.
 * - `continueWith(pan)`: when native ends, pan may continue on the same touch,
 *   supporting the content→sheet collapse handoff mid-gesture.
 *
 * Idempotent: does not duplicate relations on repeated calls.
 */
export function setupSheetScrollGestureRelations<TGesture>(
  nativeGesture: GestureRelations<TGesture>,
  sheetGesture: TGesture,
): void {
  if (!nativeGesture.waitFor.includes(sheetGesture)) {
    nativeGesture.externalWaitFor(sheetGesture)
  }
  if (!nativeGesture.continueWith.includes(sheetGesture)) {
    nativeGesture.externalContinueWith(sheetGesture)
  }
}

/**
 * Parse a getScrollInfo result into an atStart boolean for the given side.
 * Returns undefined when scroll offset fields are absent.
 */
export function parseScrollInfoAtStart(
  resolvedSide: 'top' | 'bottom' | 'left' | 'right',
  info: { scrollX?: number, scrollY?: number },
): boolean | undefined {
  const isHorizontal = resolvedSide === 'left' || resolvedSide === 'right'
  const offset = isHorizontal ? info.scrollX : info.scrollY
  if (offset === undefined) return undefined
  return offset <= 0
}
