// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { useSheetGestureContext } from '../context'

export interface SheetScrollBoundaryController {
  /**
   * Report whether a custom scrolling container is currently at the boundary
   * from which a collapsing Sheet should take ownership.
   */
  setAtStart: (atStart: boolean) => void
}

/**
 * Bridge boundary state from a custom scrolling container into the Sheet's
 * nested-gesture ownership policy.
 *
 * Native ScrollView and List integrations do not need this hook because their
 * NativeGesture events expose the boundary directly. Use this hook only when a
 * custom container owns scrolling and can report whether it is at its start.
 *
 * @example
 * ```tsx
 * function CustomScroller() {
 *   const scrollGesture = useSheetScrollGesture()
 *   const { setAtStart } = useSheetScrollBoundary()
 *   return (
 *     <CustomScrollContainer
 *       gesture={scrollGesture}
 *       onBoundaryChange={({ atStart }) => setAtStart(atStart)}
 *     />
 *   )
 * }
 * ```
 */
export function useSheetScrollBoundary(): SheetScrollBoundaryController {
  const { setScrollAtStart } = useSheetGestureContext()
  if (!setScrollAtStart) {
    throw new Error(
      'useSheetScrollBoundary must be used inside SheetGestureContent',
    )
  }
  return { setAtStart: setScrollAtStart }
}
