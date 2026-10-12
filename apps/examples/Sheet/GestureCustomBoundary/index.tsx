// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { root, useRef, useState } from '@lynx-js/react'

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

import { TriggerButton } from '../shared/index.js'
import './index.css'

/**
 * Represents a custom scroll abstraction that owns gesture binding and reports
 * only its start-boundary state to Sheet.
 */
function CustomScrollContainer() {
  const scrollGesture = useSheetScrollGesture()
  const { setAtStart } = useSheetScrollBoundary()
  const [status, setStatus] = useState('Custom container at start')

  return (
    <>
      <view className='boundary-status'>
        <text className='boundary-status-label'>Boundary adapter status</text>
        <text className='boundary-status-value'>{status}</text>
      </view>
      <scroll-view
        className='custom-scroll'
        scroll-orientation='vertical'
        bounces={false}
        main-thread:gesture={scrollGesture}
        onScroll={() => setStatus('Custom container scrolling')}
        onScrollToUpper={() => {
          setAtStart(true)
          setStatus('Custom container at start')
        }}
        onScrollToNormalState={() => setAtStart(false)}
      >
        {Array.from(
          { length: 20 },
          (_, index) => (
            <view className='custom-row' key={index}>
              <text>{`Custom row ${index + 1}`}</text>
            </view>
          ),
        )}
      </scroll-view>
    </>
  )
}

function App() {
  const sheetRef = useRef<SheetRootRef>(null)

  return (
    <view className='demo-container lunaris-dark'>
      <text className='title-text'>Gesture Sheet + Custom Boundary</text>
      <text className='subtitle-text'>
        A custom scroll abstraction reports only whether it is at its start.
      </text>
      <TriggerButton
        onClick={() => sheetRef.current?.open()}
        text='Open custom-boundary Sheet'
      />
      <SheetRoot ref={sheetRef} snapPoints={['55%', '90%']} initialSnap={0}>
        <SheetView className='sheet-viewport'>
          <SheetBackdrop className='sheet-overlay' />
          <SheetGestureContent
            className='sheet-content'
            innerClassName='custom-sheet-inner'
          >
            <SheetHandle className='sheet-handle' />
            <CustomScrollContainer />
          </SheetGestureContent>
        </SheetView>
      </SheetRoot>
    </view>
  )
}

root.render(<App />)
export default App
