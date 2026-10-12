// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { root, useRef, useState } from '@lynx-js/react'

import {
  SheetBackdrop,
  SheetGestureContent,
  SheetHandle,
  SheetRoot,
  SheetView,
  useSheetScrollGesture,
  useSheetScrollHandlers,
} from '@lynx-js/lynx-ui'
import type { SheetRootRef } from '@lynx-js/lynx-ui'

import { TriggerButton } from '../shared/index.js'
import './index.css'

interface ScrollEvent {
  detail?: {
    scrollTop?: number
    scrollLeft?: number
    scrollX?: number
    scrollY?: number
  }
}

function ScrollEventsContent() {
  const scrollGesture = useSheetScrollGesture()
  const scrollHandlers = useSheetScrollHandlers()
  const [status, setStatus] = useState('At start')

  return (
    <>
      <view className='event-status'>
        <text className='event-status-label'>Scroll event status</text>
        <text className='event-status-value'>{status}</text>
      </view>
      <scroll-view
        className='event-scroll'
        scroll-orientation='vertical'
        bounces={false}
        main-thread:gesture={scrollGesture}
        onScroll={(event: ScrollEvent) => {
          scrollHandlers.onScroll(event)
          setStatus('Scrolling')
        }}
        onScrollToUpper={() => {
          scrollHandlers.onScrollToUpper()
          setStatus('Reached start')
        }}
        onScrollToLower={() => {
          scrollHandlers.onScrollToLower()
          setStatus('Reached end')
        }}
      >
        {Array.from(
          { length: 20 },
          (_, index) => (
            <view className='event-row' key={index}>
              <text>{`Event row ${index + 1}`}</text>
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
      <text className='title-text'>Gesture Sheet + Scroll Events</text>
      <text className='subtitle-text'>
        Opt in to explicit boundary handlers while composing your own scroll
        callbacks.
      </text>
      <TriggerButton
        onClick={() => sheetRef.current?.open()}
        text='Open scroll-events Sheet'
      />
      <SheetRoot ref={sheetRef} snapPoints={['55%', '90%']} initialSnap={0}>
        <SheetView className='sheet-viewport'>
          <SheetBackdrop className='sheet-overlay' />
          <SheetGestureContent
            className='sheet-content'
            innerClassName='event-sheet-inner'
          >
            <SheetHandle className='sheet-handle' />
            <ScrollEventsContent />
          </SheetGestureContent>
        </SheetView>
      </SheetRoot>
    </view>
  )
}

root.render(<App />)
export default App
