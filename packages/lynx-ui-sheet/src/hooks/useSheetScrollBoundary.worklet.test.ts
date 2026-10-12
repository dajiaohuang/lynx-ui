// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(__dirname, './useSheetScrollBoundary.ts'),
  'utf-8',
)

describe('useSheetScrollBoundary main-thread bridge', () => {
  it('uses a named main-thread worklet', () => {
    expect(source).toContain('function setAtStartMT(atStart: boolean)')
    expect(source).toContain('\'main thread\'')
    expect(source).toContain('runOnMainThread(setAtStartMT)(atStart)')
  })

  it('does not serialize MainThreadRef objects as worklet arguments', () => {
    expect(source).not.toMatch(
      /runOnMainThread\([^)]*\)\((?:activeScrollMTRef|scrollBoundaryMTRef)\)/,
    )
  })
})
