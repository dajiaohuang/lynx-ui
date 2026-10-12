---
'@lynx-js/lynx-ui-sheet': minor
---

Add `useSheetScrollHandlers()` hook and `scrollHandlers` render prop to feed scroll boundary info from the user's ScrollView into the sheet gesture. This fixes the downward collapse handoff where content scrolls to its start on a same-touch drag but the sheet cannot take over because the native gesture event params do not reliably provide `isAtStart`/`scrollY`.

- New `useSheetScrollHandlers(resolvedSide?)` hook returns `onScroll`/`onScrollToUpper`/`onScrollToLower` background-thread handlers to spread onto the ScrollView.
- `SheetGestureContent` render prop now returns `{ scrollGesture, scrollHandlers }`.
- Native gesture `onUpdate` only overwrites `atStart` when gesture event params explicitly supply boundary info; externally fed values are preserved.
