---
nav:
  path: /hooks
---

# useImageDecode

A hook that helps you detect and track `img` decode and painted states by leveraging `HTMLImageElement.decode()` and a double `requestAnimationFrame` flush.

## Features

- 📥 Auto-decodes image whenever the `img` element is mounted or `src` changes
- 🧩 Tracks decode lifecycle: `idle`, `loading`, `decoded`, `painted`, `error`
- ⏱ Reports when the image is actually painted to screen (via double rAF)
- 🛡 Supports cancellation on component unmount / `src` changes
- 📣 Callback hooks for `onDecoded` and `onPainted`

## When to Use

- Display a loading placeholder until the image decode completes
- Avoid layout jitter by waiting for decoded/painted state before showing content
- Implement progressive image reveal, fade-in animations, or lazy-loading effects
- Track image load health and handle decode errors cleanly

## Usage

```tsx
import React, { useRef } from "react";
import { useImageDecode } from "@ahooks/external-hooks";

function MyImage({ src }: { src: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const { status, isLoading, isPainted, error, naturalWidth, naturalHeight } =
    useImageDecode(ref, {
      onDecoded(image) {
        console.log("decoded", image.naturalWidth, image.naturalHeight);
      },
      onPainted(image) {
        console.log("painted", image.src);
      },
    });

  return (
    <div>
      <p>status: {status}</p>
      <p>isLoading: {String(isLoading)}</p>
      <p>isPainted: {String(isPainted)}</p>
      <p>error: {error ?? "none"}</p>
      <p>
        size: {naturalWidth}x{naturalHeight}
      </p>
      <img ref={ref} src={src} alt="Decoded image" />
    </div>
  );
}
```

## API

```ts
useImageDecode(
  imgRef: React.RefObject<HTMLImageElement>,
  options?: {
    onDecoded?: (el: HTMLImageElement) => void;
    onPainted?: (el: HTMLImageElement) => void;
  }
): {
  status: 'idle' | 'loading' | 'decoded' | 'error' | 'painted';
  isLoading: boolean;
  isDecoded: boolean;
  isPainted: boolean;
  isError: boolean;
  error: string | null;
  naturalWidth: number;
  naturalHeight: number;
};
```

### `options`

- `onDecoded`: called after `img.decode()` resolves successfully.
- `onPainted`: called after two consecutive `requestAnimationFrame` ticks to ensure draw frame complete.

### Return values

- `status` - current decode flow state
- `isLoading` - `true` while `decode()` is in progress
- `isDecoded` - `true` after decode success
- `isPainted` - `true` after painted flush
- `isError` - `true` on decode failure
- `error` - error message or `null`
- `naturalWidth`, `naturalHeight` - decoded image dimensions

## Behavior

1. On mount, the hook starts decode if `imgRef.current` exists.
2. If `src` changes, it re-decodes via `MutationObserver` on the `src` attribute.
3. After `decode()` resolves, state becomes `decoded` and `onDecoded` is invoked.
4. Uses `requestAnimationFrame` twice to confirm the paint phase, then sets `painted` and invokes `onPainted`.
5. On failure, sets `error` and `status` to `error`.
6. Cleans up pending rAF and observer on unmount, and cancels previous decode flow when source changes.

## Notes

- Requires browser support for `HTMLImageElement.decode()` (modern browsers). Fallback behavior for older browsers is not included.
- The hook expects a valid `img` DOM node reference; it does nothing when ref is missing.
