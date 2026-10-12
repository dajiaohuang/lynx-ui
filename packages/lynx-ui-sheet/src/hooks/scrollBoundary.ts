// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * Resolve the next value for `contentAtStart` given the current value and
 * the boundary value derived from native gesture event params.
 *
 * Preserves the current value when params don't explicitly supply boundary
 * info, so a custom scrolling container's reported value is not wiped out.
 */
export function resolveNextContentAtStart(
  current: boolean | undefined,
  fromParams: boolean | undefined,
): boolean | undefined {
  return fromParams ?? current
}
