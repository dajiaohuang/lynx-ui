// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { runOnMainThread, useCallback } from '@lynx-js/react'

import { useSheetContext, useSheetGestureContext } from '../context'
import { computeAtStartFromScroll } from './scrollBoundary'

export interface SheetScrollEvent {
  detail?: {
    scrollTop?: number
    scrollLeft?: number
    scrollX?: number
    scrollY?: number
  }
}

export interface SheetScrollHandlers {
  /**
   * Spread onto the ScrollView that contains the sheet content.
   * Feeds scroll boundary info back to the sheet gesture so the nested
   * scroll → sheet collapse handoff works reliably.
   */
  onScroll: (event: SheetScrollEvent) => void
  onScrollToUpper: () => void
  onScrollToLower: () => void
}

/**
 * Background-thread scroll boundary handlers that bridge ScrollView scroll
 * events into the main-thread sheet gesture state.
 *
 * Use this only when the native scrolling component does not synchronously
 * expose its start boundary through the gesture event, or when an application
 * already handles scroll events and wants to feed those explicit boundaries
 * into the Sheet. Standard ScrollView and List integrations only need
 * `useSheetScrollGesture()`.
 *
 * The handlers update both a persistent boundary ref (survives across touches)
 * and the active gesture state (for the current touch). The persistent value
 * is seeded into the active state on touch down, so boundary state from prior
 * scroll events is available at the start of the next drag.
 *
 * @example
 * ```tsx
 * function CustomScrollContent() {
 *   const scrollGesture = useSheetScrollGesture()
 *   const scrollHandlers = useSheetScrollHandlers()
 *   return (
 *     <ScrollView
 *       main-thread:gesture={scrollGesture}
 *       onScroll={(event) => {
 *         scrollHandlers.onScroll(event)
 *         trackScroll(event)
 *       }}
 *       onScrollToUpper={scrollHandlers.onScrollToUpper}
 *       onScrollToLower={scrollHandlers.onScrollToLower}
 *     >
 *       ...
 *     </ScrollView>
 *   )
 * }
 * ```
 */
export function useSheetScrollHandlers(): SheetScrollHandlers {
  const gestureContext = useSheetGestureContext()
  const sheetContext = useSheetContext()
  const activeScrollMTRef = gestureContext.activeScrollMTRef
  const scrollBoundaryMTRef = gestureContext.scrollBoundaryMTRef
  const resolvedSide = sheetContext.resolvedSide ?? 'bottom'

  function setAtStartMT(atStart: boolean) {
    'main thread'
    if (scrollBoundaryMTRef) {
      scrollBoundaryMTRef.current.atStart = atStart
    }
    if (activeScrollMTRef?.current) {
      activeScrollMTRef.current.atStart = atStart
    }
  }

  const setAtStart = useCallback(
    (atStart: boolean) => {
      runOnMainThread(setAtStartMT)(atStart)
    },
    [setAtStartMT],
  )

  const onScroll = useCallback(
    (event: SheetScrollEvent) => {
      const atStart = computeAtStartFromScroll(resolvedSide, event)
      if (atStart !== undefined) {
        setAtStart(atStart)
      }
    },
    [resolvedSide, setAtStart],
  )

  const onScrollToUpper = useCallback(() => {
    setAtStart(true)
  }, [setAtStart])

  const onScrollToLower = useCallback(() => {
    setAtStart(false)
  }, [setAtStart])

  return { onScroll, onScrollToUpper, onScrollToLower }
}
