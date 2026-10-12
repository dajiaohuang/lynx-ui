// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { describe, expect, it } from 'vitest'

import {
  parseScrollInfoAtStart,
  setupSheetScrollGestureRelations,
} from './gestureRelations'

describe('setupSheetScrollGestureRelations', () => {
  function makeFakeGesture() {
    const waitFor: unknown[] = []
    const continueWith: unknown[] = []
    return {
      waitFor,
      continueWith,
      externalWaitFor(g: unknown) {
        waitFor.push(g)
      },
      externalContinueWith(g: unknown) {
        continueWith.push(g)
      },
    }
  }

  it('sets up both waitFor and continueWith relations', () => {
    const native = makeFakeGesture()
    const pan = { type: 'pan' }
    setupSheetScrollGestureRelations(native, pan)
    expect(native.waitFor).toContain(pan)
    expect(native.continueWith).toContain(pan)
  })

  it('each relation appears exactly once (idempotent)', () => {
    const native = makeFakeGesture()
    const pan = { type: 'pan' }
    setupSheetScrollGestureRelations(native, pan)
    setupSheetScrollGestureRelations(native, pan)
    setupSheetScrollGestureRelations(native, pan)
    expect(native.waitFor.filter((g) => g === pan).length).toBe(1)
    expect(native.continueWith.filter((g) => g === pan).length).toBe(1)
  })
})

describe('parseScrollInfoAtStart', () => {
  it('vertical: atStart when scrollY <= 0', () => {
    expect(parseScrollInfoAtStart('bottom', { scrollY: 0 })).toBe(true)
    expect(parseScrollInfoAtStart('bottom', { scrollY: -5 })).toBe(true)
  })

  it('vertical: not atStart when scrollY > 0', () => {
    expect(parseScrollInfoAtStart('bottom', { scrollY: 50 })).toBe(false)
  })

  it('horizontal: atStart when scrollX <= 0', () => {
    expect(parseScrollInfoAtStart('left', { scrollX: 0 })).toBe(true)
  })

  it('horizontal: not atStart when scrollX > 0', () => {
    expect(parseScrollInfoAtStart('right', { scrollX: 30 })).toBe(false)
  })

  it('returns undefined when offset field absent', () => {
    expect(parseScrollInfoAtStart('bottom', {})).toBeUndefined()
    expect(parseScrollInfoAtStart('bottom', { scrollX: 0 })).toBeUndefined()
  })
})
