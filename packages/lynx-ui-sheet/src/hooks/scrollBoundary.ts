// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Compute whether the content is at its leading boundary (start) from a
 * scroll event, using the sheet's resolved side to pick the primary axis.
 * Returns `undefined` when the relevant offset field is absent, so the caller
 * can preserve the existing state instead of falsely reporting at-start.
 */
export function computeAtStartFromScroll(
  resolvedSide: 'top' | 'bottom' | 'left' | 'right',
  e: {
    detail?: {
      scrollTop?: number
      scrollLeft?: number
      scrollX?: number
      scrollY?: number
    }
  },
): boolean | undefined {
  const isHorizontal = resolvedSide === 'left' || resolvedSide === 'right'
  const offset = isHorizontal
    ? (e.detail?.scrollX ?? e.detail?.scrollLeft)
    : (e.detail?.scrollY ?? e.detail?.scrollTop)
  if (offset === undefined) return undefined
  return offset <= 0
}

/**
 * Resolve the next value for `contentAtStart` given the current value and
 * the boundary value derived from gesture event params.
 *
 * Preserves the current value when params don't explicitly supply boundary
 * info (undefined), so externally fed values (from scroll handlers) are not
 * wiped out by onUpdate callbacks that lack reliable boundary data.
 */
export function resolveNextContentAtStart(
  current: boolean | undefined,
  fromParams: boolean | undefined,
): boolean | undefined {
  return fromParams ?? current
}
