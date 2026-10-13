// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import { useSheetScrollBoundary } from './useSheetScrollBoundary'

const context = vi.hoisted(() => ({
  setScrollAtStart: undefined as undefined | ((value: boolean) => void),
}))
vi.mock('../context', () => ({ useSheetGestureContext: () => context }))

describe('custom boundary owner command', () => {
  it('forwards true and false to the owner without a descendant worklet', () => {
    const command = vi.fn()
    context.setScrollAtStart = command
    const controller = useSheetScrollBoundary()
    expect(controller.setAtStart).toBe(command)
    controller.setAtStart(true)
    controller.setAtStart(false)
    expect(command.mock.calls).toEqual([[true], [false]])
    context.setScrollAtStart = undefined
  })

  it('rejects use outside the owner provider', () => {
    context.setScrollAtStart = undefined
    expect(() => useSheetScrollBoundary()).toThrow('inside SheetGestureContent')
  })

  it('keeps the worklet and ref mutation inside the owning component', () => {
    const owner = readFileSync(
      resolve(__dirname, '../SheetGestureContent/index.tsx'),
      'utf-8',
    )
    const hook = readFileSync(
      resolve(__dirname, './useSheetScrollBoundary.ts'),
      'utf-8',
    )
    expect(owner).toContain('\'main thread\'')
    expect(owner).toContain('runOnMainThread(setScrollAtStartMT)(atStart)')
    expect(hook).not.toContain('runOnMainThread')
    expect(hook).not.toContain('.current')
  })
})
