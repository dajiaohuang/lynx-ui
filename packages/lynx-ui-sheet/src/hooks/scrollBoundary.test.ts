// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { describe, expect, it } from 'vitest'

import { resolveNestedScrollOwner } from './nestedScroll'
import {
  computeAtStartFromScroll,
  resolveNextContentAtStart,
} from './scrollBoundary'

describe('computeAtStartFromScroll', () => {
  it('vertical sheet: atStart when scrollTop <= 0', () => {
    expect(computeAtStartFromScroll('bottom', { detail: { scrollTop: 0 } }))
      .toBe(true)
    expect(computeAtStartFromScroll('bottom', { detail: { scrollTop: -5 } }))
      .toBe(true)
  })

  it('vertical sheet: not atStart when scrollTop > 0', () => {
    expect(computeAtStartFromScroll('bottom', { detail: { scrollTop: 50 } }))
      .toBe(false)
  })

  it('horizontal sheet: atStart when scrollLeft <= 0', () => {
    expect(computeAtStartFromScroll('left', { detail: { scrollLeft: 0 } }))
      .toBe(true)
    expect(computeAtStartFromScroll('right', { detail: { scrollLeft: -10 } }))
      .toBe(true)
  })

  it('horizontal sheet: not atStart when scrollLeft > 0', () => {
    expect(computeAtStartFromScroll('left', { detail: { scrollLeft: 30 } }))
      .toBe(false)
  })

  it('returns undefined when relevant offset field is absent (preserves existing state)', () => {
    expect(computeAtStartFromScroll('bottom', {})).toBeUndefined()
    expect(computeAtStartFromScroll('bottom', { detail: {} })).toBeUndefined()
    expect(computeAtStartFromScroll('left', { detail: { scrollTop: 0 } }))
      .toBeUndefined()
  })
})

describe('resolveNextContentAtStart', () => {
  it('preserves current value when params do not supply boundary info (undefined)', () => {
    // This is the core fix: when gesture event params lack boundary info
    // (isAtStart and scrollY both absent), the externally fed atStart value
    // should be preserved, not overwritten with undefined.
    expect(resolveNextContentAtStart(true, undefined)).toBe(true)
    expect(resolveNextContentAtStart(false, undefined)).toBe(false)
    expect(resolveNextContentAtStart(undefined, undefined)).toBeUndefined()
  })

  it('overwrites when params explicitly supply true', () => {
    expect(resolveNextContentAtStart(false, true)).toBe(true)
    expect(resolveNextContentAtStart(undefined, true)).toBe(true)
  })

  it('overwrites when params explicitly supply false', () => {
    expect(resolveNextContentAtStart(true, false)).toBe(false)
    expect(resolveNextContentAtStart(undefined, false)).toBe(false)
  })
})

describe('resolveNestedScrollOwner (unchanged contract)', () => {
  const base = { position: 400, maximumPosition: 800 }

  it('collapse: contentAtStart=true → sheet (handoff works when boundary known)', () => {
    expect(
      resolveNestedScrollOwner({ ...base, delta: -20, contentAtStart: true }),
    ).toBe('sheet')
  })

  it('collapse: contentAtStart=false → content (content scrolls first)', () => {
    expect(
      resolveNestedScrollOwner({ ...base, delta: -20, contentAtStart: false }),
    ).toBe('content')
  })

  it('collapse: contentAtStart=undefined → content (unknown boundary defaults to content)', () => {
    // This is the key contract: when boundary is unknown, we conservatively
    // stay in content. The scroll handlers must feed atStart=true before the
    // handoff can occur.
    expect(
      resolveNestedScrollOwner({
        ...base,
        delta: -20,
        contentAtStart: undefined,
      }),
    ).toBe('content')
  })

  it('expand: position < maximum → sheet (pull-up path unaffected)', () => {
    expect(
      resolveNestedScrollOwner({ ...base, delta: 20, contentAtStart: true }),
    ).toBe('sheet')
  })
})
