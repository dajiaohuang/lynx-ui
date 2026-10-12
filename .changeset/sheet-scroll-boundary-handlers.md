---
'@lynx-js/lynx-ui-sheet': minor
---

Add gesture-runtime nested scrolling with same-touch handoff between a Sheet and its scrolling content.

- Native ScrollView and List integrations bind only `useSheetScrollGesture()`; their native gesture events provide the scroll boundary directly.
- Add `useSheetScrollBoundary()` as an opt-in adapter for custom scrolling containers that report their own `atStart` boundary.
- Preserve externally reported custom-container boundaries when native gesture event params do not provide one.
