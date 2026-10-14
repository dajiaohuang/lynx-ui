// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { describe, expect, it, vi } from 'vitest'

import { setupSheetScrollGestureRelations } from './gestureRelations'
import {
  useSheetNativeScrollGesture,
  useSheetPanGesture,
} from './useSheetGestures'

const runtime = vi.hoisted(() => {
  interface Event {
    params: {
      pageX: number
      pageY: number
      isAtStart?: boolean | number
      scrollY?: number
    }
    currentTarget?: { invoke: () => Promise<{ scrollY: number }> }
  }
  interface Manager {
    consumeGesture: (value: boolean) => void
    fail: () => void
  }
  type Callback = (event: Event, manager: Manager) => void
  class Gesture {
    execId = 0
    callbacks: Record<string, Callback> = {}
    waitFor: unknown[] = []
    continueWith: unknown[] = []
    simultaneousWith: unknown[] = []
    enabled() {
      return this
    }
    minDistance() {
      return this
    }
    updateConfig() {
      return this
    }
    onBegin(fn: Callback) {
      this.callbacks.begin = fn
      return this
    }
    onUpdate(fn: Callback) {
      this.callbacks.update = fn
      return this
    }
    onEnd(fn: Callback) {
      this.callbacks.end = fn
      return this
    }
    onTouchesDown(fn: Callback) {
      this.callbacks.down = fn
      return this
    }
    onTouchesMove(fn: Callback) {
      this.callbacks.move = fn
      return this
    }
    onTouchesUp(fn: Callback) {
      this.callbacks.up = fn
      return this
    }
    onTouchesCancel(fn: Callback) {
      this.callbacks.cancel = fn
      return this
    }
    externalWaitFor = (g: unknown) => {
      this.waitFor.push(g)
      return this
    }
    externalContinueWith = (g: unknown) => {
      this.continueWith.push(g)
      return this
    }
    externalSimultaneous = (g: unknown) => {
      this.simultaneousWith.push(g)
      return this
    }
  }
  return { Gesture }
})

vi.mock(
  '@lynx-js/react',
  () => ({
    useMainThreadRef: <T>(current: T) => ({ current }),
    useRef: <T>(current: T) => ({ current }),
  }),
)
vi.mock('@lynx-js/gesture-runtime', () => ({
  NativeGesture: runtime.Gesture,
  PanGesture: runtime.Gesture,
  useGesture: () => new runtime.Gesture(),
}))
vi.mock('../context', () => ({ useSheetGestureContext: () => ({}) }))
vi.mock(
  './useSnapTouches',
  () => ({ getRubberBandConfig: () => ({ enabled: false }) }),
)
vi.mock('@lynx-js/lynx-ui-presence', () => ({ PresenceState: {} }))

function makeManager() {
  return { consumeGesture: vi.fn(), fail: vi.fn() }
}
function event(pageY: number, pageX = 0) {
  return { params: { pageX, pageY } }
}
function makePan(offsets = [450, 900], overrides = {}) {
  let value = 450
  const motion = {
    get: () => value,
    set: (next: number) => {
      value = next
    },
    getVelocity: () => 0,
  }
  const scrollManager = makeManager()
  const options = {
    activeScrollMTRef: { current: { manager: scrollManager, atStart: true } },
    yRef: { current: motion },
    viewportSize: 1000,
    sheetSizeMTRef: { current: 900 },
    getResolvedSnapOffsets: () => offsets,
    onSnapChangeMT: vi.fn(),
    onDragStartMT: vi.fn(),
    onDragEndSnapMT: vi.fn(),
    onDragEndCloseMT: vi.fn(),
    ...overrides,
  }
  const gesture = useSheetPanGesture(
    options as unknown as Parameters<typeof useSheetPanGesture>[0],
  ) as unknown as InstanceType<typeof runtime.Gesture>
  return { gesture, motion, options, scrollManager }
}

describe('native scroll coordination', () => {
  function native(
    options?: { sheetGesture?: object, active?: { current: unknown } },
  ) {
    const active = options?.active ?? { current: null }
    const gesture = useSheetNativeScrollGesture(
      {
        sheetGesture: options?.sheetGesture ?? {},
        activeScrollMTRef: active,
        resolvedSide: 'bottom',
        position: { current: { get: () => 900 } },
        getResolvedSnapOffsets: () => [450, 900],
      } as unknown as Parameters<typeof useSheetNativeScrollGesture>[0],
    ) as unknown as InstanceType<typeof runtime.Gesture>
    return {
      gesture,
      active: active as { current: { atStart?: boolean } | null },
    }
  }
  function down(
    pageY: number,
    query: Promise<{ scrollY: number }>,
    atStart?: boolean,
  ) {
    return {
      params: {
        pageX: 0,
        pageY,
        ...(atStart === undefined ? {} : { isAtStart: atStart }),
      },
      currentTarget: { invoke: () => query },
    }
  }
  function deferred() {
    let resolve!: (value: { scrollY: number }) => void
    const promise = new Promise<{ scrollY: number }>(r => {
      resolve = r
    })
    return { promise, resolve }
  }
  it('notifies the maximum snap after expanding and handing off to content', () => {
    const { gesture, motion, options } = makePan()
    const manager = makeManager()
    gesture.callbacks.begin(event(500), manager)
    gesture.callbacks.update(event(0), manager)
    expect(motion.get()).toBe(900)
    gesture.callbacks.update(event(-20), manager)
    gesture.callbacks.end(event(-20), manager)
    expect(options.onSnapChangeMT).toHaveBeenCalledWith(1, 900)
    expect(options.onDragEndSnapMT).not.toHaveBeenCalled()
  })
  it('does not repeat a native consumption command while the owner stays Sheet', () => {
    const { gesture, scrollManager } = makePan()
    const manager = makeManager()
    gesture.callbacks.begin(event(500), manager)
    gesture.callbacks.update(event(490), manager)
    gesture.callbacks.update(event(480), manager)
    gesture.callbacks.update(event(470), manager)
    expect(scrollManager.consumeGesture.mock.calls).toEqual([[false]])
  })

  it('queries the boundary only when native fields are absent', async () => {
    const { gesture, active } = native()
    const manager = makeManager(), query = deferred()
    const target = { invoke: vi.fn(() => query.promise) }
    gesture.callbacks.down({
      params: { pageX: 0, pageY: 100 },
      currentTarget: target,
    }, manager)
    expect(target.invoke).toHaveBeenCalledWith('getScrollInfo')
    query.resolve({ scrollY: 0 })
    await query.promise
    expect(active.current?.atStart).toBe(true)
    gesture.callbacks.up(event(100), manager)
    target.invoke.mockClear()
    gesture.callbacks.down({
      params: { pageX: 0, pageY: 100, isAtStart: true },
      currentTarget: target,
    }, manager)
    expect(target.invoke).not.toHaveBeenCalled()
  })

  it.each([true, 1])('accepts native start-boundary value %s', atStart => {
    const { gesture, active } = native()
    const manager = makeManager()
    gesture.callbacks.down(down(100, Promise.resolve({ scrollY: 80 })), manager)
    gesture.callbacks.update({
      params: { pageX: 0, pageY: 110, isAtStart: atStart },
    }, manager)
    expect(active.current?.atStart).toBe(true)
  })

  it('leaves a cross-axis child gesture free to scroll', () => {
    const { gesture, motion, options } = makePan()
    const manager = makeManager()
    gesture.callbacks.begin(event(100, 0), manager)
    gesture.callbacks.update(event(101, 40), manager)
    expect(motion.get()).toBe(450)
    expect(options.onDragStartMT).not.toHaveBeenCalled()
    expect(manager.fail).toHaveBeenCalled()
  })

  it('releases the native coordinator for a cross-axis child', () => {
    const { gesture } = native()
    const manager = makeManager()
    gesture.callbacks.down(
      down(100, Promise.resolve({ scrollY: 0 }), true),
      manager,
    )
    gesture.callbacks.update({
      params: { pageX: 40, pageY: 101, isAtStart: true },
    }, manager)
    expect(manager.consumeGesture).toHaveBeenCalledWith(true)
    expect(manager.fail).toHaveBeenCalled()
  })
  it('retains a live native boundary when an older query resolves during the touch', async () => {
    const { gesture, active } = native()
    const manager = makeManager(), query = deferred()
    gesture.callbacks.down(down(100, query.promise), manager)
    gesture.callbacks.update({
      params: { pageX: 0, pageY: 110, isAtStart: true },
    }, manager)
    expect(active.current?.atStart).toBe(true)
    query.resolve({ scrollY: 80 })
    await query.promise
    expect(active.current?.atStart).toBe(true)
  })
  it('does not seed a later touch from an expired query', async () => {
    const { gesture, active } = native()
    const manager = makeManager(), oldQuery = deferred()
    gesture.callbacks.down(down(100, oldQuery.promise), manager)
    gesture.callbacks.up(event(100), manager)
    gesture.callbacks.down(
      down(200, Promise.resolve({ scrollY: 0 }), true),
      manager,
    )
    await Promise.resolve()
    oldQuery.resolve({ scrollY: 80 })
    await oldQuery.promise
    expect(active.current?.atStart).toBe(true)
    gesture.callbacks.up(event(200), manager)
    const pending = deferred()
    gesture.callbacks.down(down(300, pending.promise), manager)
    expect(active.current?.atStart).toBeUndefined()
  })

  it.each([{ dragDisabled: true }, { gestureConfig: { enabled: false } }])(
    'rejects updates when dragging is disabled: %j',
    overrides => {
      const { gesture, motion, options } = makePan([450, 900], overrides)
      const manager = makeManager()
      gesture.callbacks.begin(event(500), manager)
      gesture.callbacks.update(event(100), manager)
      gesture.callbacks.end(event(100), manager)
      expect(motion.get()).toBe(450)
      expect(options.onDragStartMT).not.toHaveBeenCalled()
      expect(options.onDragEndSnapMT).not.toHaveBeenCalled()
      expect(manager.fail).toHaveBeenCalled()
    },
  )
  it('reverses from content to Sheet without ending or restarting the pan', () => {
    const { gesture, motion, options } = makePan()
    const manager = makeManager()
    motion.set(900)
    options.activeScrollMTRef.current.atStart = false
    gesture.callbacks.begin(event(100), manager)
    gesture.callbacks.update(event(120), manager)
    options.activeScrollMTRef.current.atStart = true
    gesture.callbacks.update(event(140), manager)
    expect(motion.get()).toBe(880)
    expect(manager.fail).not.toHaveBeenCalled()
  })
})

describe('relations across recognizer clones', () => {
  it('retains one relation per recognizer ID across rerenders', () => {
    const native = new runtime.Gesture()
    for (let i = 0; i < 3; i++) {
      setupSheetScrollGestureRelations(native, { id: 10, type: 0 })
    }
    expect(native.simultaneousWith).toHaveLength(1)
    expect(native.waitFor).toEqual([])
    expect(native.continueWith).toEqual([])
  })
})
