// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { root, useCallback, useRef, useState } from '@lynx-js/react'

import type { SheetRootRef } from '@lynx-js/lynx-ui'
import {
  SheetBackdrop,
  SheetGestureContent,
  SheetHandle,
  SheetRoot,
  SheetView,
  useSheetScrollBoundary,
  useSheetScrollGesture,
} from '@lynx-js/lynx-ui'
import type { ScrollViewProps } from '@lynx-js/types'

import { TriggerButton } from '../shared/index.js'
import './index.css'

interface BoundaryState {
  atStart: boolean
  offset: number
}

interface CustomScrollContainerProps {
  gesture: ReturnType<typeof useSheetScrollGesture>
  onBoundaryChange: (state: BoundaryState) => void
  onReachEnd: () => void
}

/**
 * Native-backed adapter example, not a non-native scrolling engine.
 * Its public boundary callback is independent of native event payloads.
 */
function CustomScrollContainer({
  gesture,
  onBoundaryChange,
  onReachEnd,
}: CustomScrollContainerProps) {
  const handleScroll: NonNullable<ScrollViewProps['bindscroll']> = (event) => {
    const offset = event.detail.scrollTop
    onBoundaryChange({ atStart: offset <= 0, offset })
  }

  return (
    <scroll-view
      className='custom-scroll'
      scroll-orientation='vertical'
      bounces={false}
      main-thread:gesture={gesture}
      bindscroll={handleScroll}
      bindscrolltoupper={() => onBoundaryChange({ atStart: true, offset: 0 })}
      bindscrolltolower={onReachEnd}
    >
      {Array.from(
        { length: 20 },
        (_, index) => (
          <view className='custom-row' key={index}>
            <text>{`Adapter row ${index + 1}`}</text>
          </view>
        ),
      )}
    </scroll-view>
  )
}

function CustomBoundaryContent() {
  const gesture = useSheetScrollGesture()
  const { setAtStart } = useSheetScrollBoundary()
  const [boundary, setBoundary] = useState<BoundaryState>({
    atStart: true,
    offset: 0,
  })
  const [endVisits, setEndVisits] = useState(0)
  const handleBoundaryChange = useCallback((state: BoundaryState) => {
    setAtStart(state.atStart)
    setBoundary(state)
  }, [setAtStart])

  return (
    <>
      <view className='boundary-status'>
        <text className='boundary-status-label'>
          Native-backed boundary adapter
        </text>
        <text className='boundary-status-value'>
          {`${boundary.atStart ? 'At start' : 'In content'} · offset ${
            Math.round(boundary.offset)
          }`}
        </text>
        <text className='boundary-status-label'>
          {`Reached end: ${endVisits}`}
        </text>
      </view>
      <CustomScrollContainer
        gesture={gesture}
        onBoundaryChange={handleBoundaryChange}
        onReachEnd={() => setEndVisits(count => count + 1)}
      />
    </>
  )
}

function App() {
  const sheetRef = useRef<SheetRootRef>(null)

  return (
    <view className='demo-container lunaris-dark'>
      <text className='title-text'>Sheet + Boundary Adapter</text>
      <text className='subtitle-text'>
        Native-backed adapter demo. Standard native scrolling needs only the
        gesture binding.
      </text>
      <TriggerButton
        onClick={() => sheetRef.current?.open()}
        text='Open boundary adapter'
      />
      <SheetRoot ref={sheetRef} snapPoints={['55%', '90%']} initialSnap={0}>
        <SheetView className='sheet-viewport'>
          <SheetBackdrop className='sheet-overlay' />
          <SheetGestureContent
            className='sheet-content'
            innerClassName='custom-sheet-inner'
          >
            <SheetHandle className='sheet-handle' />
            <CustomBoundaryContent />
          </SheetGestureContent>
        </SheetView>
      </SheetRoot>
    </view>
  )
}

root.render(<App />)
export default App
