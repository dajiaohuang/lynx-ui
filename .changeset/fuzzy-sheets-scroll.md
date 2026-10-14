---
"@lynx-js/lynx-ui-sheet": minor
---

Add `SheetNestedScrollContent` with one coordinated native scroll gesture exposed by
both a render prop and the argument-free `useSheetScrollGesture` Hook. Nested
scrolling now follows a fixed natural handoff: expand the Sheet before scrolling
content, and return content to its start before collapsing the Sheet.
Hold an in-progress snap during nested content gestures and resume it after
touch-up, keeping panel animation from competing with native scrolling.
