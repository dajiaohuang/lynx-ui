// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  new URL('./useSheetGestures.ts', import.meta.url),
  'utf8',
)

describe('native scroll boundary normalization', () => {
  it('accepts the native numeric true value before ownership resolution', () => {
    expect(source).toContain(
      'params.isAtStart === true || params.isAtStart === 1',
    )
  })
})
