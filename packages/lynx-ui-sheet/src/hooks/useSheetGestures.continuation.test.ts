// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  new URL('./useSheetGestures.ts', import.meta.url),
  'utf8',
)

describe('sheet pan continuation after nested content yields', () => {
  it('does not retain a latch that discards continued pan updates', () => {
    expect(source).not.toContain('yieldedToContentMTRef')
  })

  it('still suppresses stale release snapping after yielding to content', () => {
    expect(source).toContain('draggingMTRef.current = false')
    expect(source).toContain('if (!draggingMTRef.current) return')
  })
})
