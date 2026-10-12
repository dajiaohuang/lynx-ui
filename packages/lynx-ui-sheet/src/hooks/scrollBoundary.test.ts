// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { describe, expect, it } from 'vitest'

import { resolveNestedScrollOwner } from './nestedScroll'
import { resolveNextContentAtStart } from './scrollBoundary'

describe('resolveNextContentAtStart', () => {
  it('preserves a custom container boundary when native params omit it', () => {
    expect(resolveNextContentAtStart(true, undefined)).toBe(true)
    expect(resolveNextContentAtStart(false, undefined)).toBe(false)
    expect(resolveNextContentAtStart(undefined, undefined)).toBeUndefined()
  })

  it('uses an explicit native boundary when present', () => {
    expect(resolveNextContentAtStart(false, true)).toBe(true)
    expect(resolveNextContentAtStart(true, false)).toBe(false)
  })
})

describe('resolveNestedScrollOwner', () => {
  const base = { position: 400, maximumPosition: 800 }

  it('hands a collapsing drag to the Sheet at content start', () => {
    expect(
      resolveNestedScrollOwner({ ...base, delta: -20, contentAtStart: true }),
    ).toBe('sheet')
  })

  it('keeps a collapsing drag in content away from its start', () => {
    expect(
      resolveNestedScrollOwner({ ...base, delta: -20, contentAtStart: false }),
    ).toBe('content')
  })

  it('keeps unknown boundaries in content', () => {
    expect(
      resolveNestedScrollOwner({
        ...base,
        delta: -20,
        contentAtStart: undefined,
      }),
    ).toBe('content')
  })

  it('preserves the expanding Sheet-first policy', () => {
    expect(
      resolveNestedScrollOwner({ ...base, delta: 20, contentAtStart: true }),
    ).toBe('sheet')
  })
})
