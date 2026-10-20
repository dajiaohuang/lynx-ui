// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { useState } from '@lynx-js/react'

import { createEvent, fireEvent, render } from '@lynx-js/react/testing-library'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Input } from '../src/Input'
import { TextArea } from '../src/TextArea'

interface NativeInvocation {
  method: string
  params?: { value: string }
}

const invoke = vi.fn((_options: NativeInvocation) => ({ exec: vi.fn() }))
const setNativeProps = vi.fn(() => ({ exec: vi.fn() }))

beforeEach(() => {
  invoke.mockClear()
  setNativeProps.mockClear()
  const prototype = Object.getPrototypeOf(
    lynx.createSelectorQuery().selectUniqueID(0),
  )
  vi.spyOn(prototype, 'invoke').mockImplementation(invoke)
  vi.spyOn(prototype, 'setNativeProps').mockImplementation(setNativeProps)
  const query = lynx.createSelectorQuery()
  // The test renderer runs mount effects before attaching native ref attributes.
  vi.spyOn(lynx, 'createSelectorQuery').mockImplementation(() => ({
    ...query,
    select: (selector: string) =>
      selector.startsWith('[react-ref-')
        ? query.selectUniqueID(0)
        : query.select(selector),
  }))
})

function input(element: Element, value: string, isComposing = false) {
  const event = createEvent('bindEvent:input', element)
  Object.assign(event, {
    eventType: 'bindEvent',
    eventName: 'input',
    detail: {
      value,
      selectionStart: value.length,
      selectionEnd: value.length,
      isComposing,
    },
  })
  fireEvent(lynx.createSelectorQuery().select('.field'), event)
}

describe.each([['Input', Input], ['TextArea', TextArea]] as const)(
  '%s',
  (_name, Component) => {
    it('forwards accepted composing input without writing native props or values', () => {
      const onInput = vi.fn()
      function Controlled() {
        const [value, setValue] = useState('')
        return (
          <Component
            className='field'
            value={value}
            onInput={(...args) => {
              onInput(...args)
              setValue(args[0])
            }}
          />
        )
      }
      const { container } = render(<Controlled />)
      const field = container.querySelector('.field')!
      invoke.mockClear()

      input(field, 'hello', true)

      expect(onInput).toHaveBeenCalledWith('hello', 5, 5, true)
      expect(setNativeProps).not.toHaveBeenCalled()
      expect(field.getAttribute('readonly')).not.toBe('true')
      expect(invoke).not.toHaveBeenCalled()
    })

    it('restores each rejected edit even when the controlled prop stays unchanged', () => {
      const { container } = render(<Component className='field' value='kept' />)
      const field = container.querySelector('.field')!
      invoke.mockClear()

      input(field, 'rejected')
      input(field, 'rejected again')

      expect(invoke).toHaveBeenCalledTimes(2)
      for (const [options] of invoke.mock.calls) {
        expect(options).toMatchObject({
          method: 'setValue',
          params: { value: 'kept' },
        })
      }
      expect(setNativeProps).not.toHaveBeenCalled()
    })

    it('applies transformed values and later controlled prop changes', () => {
      function Controlled({ prefix }: { prefix: string }) {
        const [value, setValue] = useState('')
        return (
          <Component
            className='field'
            value={prefix + value}
            onInput={next => setValue(next.toUpperCase())}
          />
        )
      }
      const { container, rerender } = render(<Controlled prefix='' />)
      invoke.mockClear()

      input(container.querySelector('.field')!, 'hello')
      expect(invoke).toHaveBeenLastCalledWith(expect.objectContaining({
        method: 'setValue',
        params: { value: 'HELLO' },
      }))
      rerender(<Controlled prefix='>' />)
      expect(invoke).toHaveBeenLastCalledWith(expect.objectContaining({
        method: 'setValue',
        params: { value: '>HELLO' },
      }))
    })

    it('initializes uncontrolled content once and leaves subsequent edits alone', () => {
      const onInput = vi.fn()
      const { container, rerender } = render(
        <Component
          className='field'
          defaultValue='initial'
          onInput={onInput}
        />,
      )
      expect(invoke).toHaveBeenCalledTimes(1)
      expect(invoke).toHaveBeenLastCalledWith(expect.objectContaining({
        method: 'setValue',
        params: { value: 'initial' },
      }))
      invoke.mockClear()
      input(container.querySelector('.field')!, 'edited')
      rerender(
        <Component
          className='field'
          defaultValue='changed'
          onInput={onInput}
        />,
      )
      expect(onInput).toHaveBeenCalledWith('edited', 6, 6, false)
      expect(invoke).not.toHaveBeenCalled()
      expect(setNativeProps).not.toHaveBeenCalled()
    })

    it('preserves readonly through input delivery and follows explicit prop updates', () => {
      const { container, rerender } = render(
        <Component className='field' value='' readonly />,
      )
      const field = container.querySelector('.field')!
      input(field, 'programmatic')
      expect(field.getAttribute('readonly')).toBe('true')
      expect(setNativeProps).not.toHaveBeenCalled()
      rerender(<Component className='field' value='' readonly={false} />)
      expect(field.getAttribute('readonly')).toBe('false')
    })
  },
)
