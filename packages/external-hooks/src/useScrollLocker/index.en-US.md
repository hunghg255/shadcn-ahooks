---
nav:
  path: /hooks
---

# useScrollLocker

A hook that locks the body scroll to prevent page scrolling, commonly used for modals, drawers, and popup components.

## Features

- 🔒 Locks body scrolling when enabled
- 📏 Automatically compensates for scrollbar width to prevent layout shift
- 🧹 Cleans up styles when unmounted or lock is disabled
- 🎯 Uses unique IDs to support multiple instances

## When to Use

- Modal dialogs and popups
- Drawer/Sidebar components
- Full-screen overlays
- Any component that needs to prevent background scrolling

## Usage

```tsx
import { useScrollLocker } from 'ahooks';

function Modal({ visible }) {
  // Lock scroll when modal is visible
  useScrollLocker(visible);

  if (!visible) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        Modal Content
      </div>
    </div>
  );
}
```

## Examples

### Basic Usage

```tsx
import React, { useState } from 'react';
import { useScrollLocker } from 'ahooks';

export default () => {
  const [isLocked, setIsLocked] = useState(false);

  useScrollLocker(isLocked);

  return (
    <div>
      <button onClick={() => setIsLocked(!isLocked)}>
        {isLocked ? 'Unlock Scroll' : 'Lock Scroll'}
      </button>
      <p>
        Scroll status: {isLocked ? '🔒 Locked' : '🔓 Unlocked'}
      </p>
      <div style={{ height: '200vh', background: 'linear-gradient(white, gray)' }}>
        <p>Try scrolling the page...</p>
      </div>
    </div>
  );
};
```

### With Modal Component

```tsx
import React, { useState } from 'react';
import { useScrollLocker } from 'ahooks';

function Modal({ visible, onClose, children }) {
  useScrollLocker(visible);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '500px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default () => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <button onClick={() => setVisible(true)}>
        Open Modal
      </button>

      <div style={{ height: '200vh' }}>
        <p>Scroll down to see more content...</p>
      </div>

      <Modal visible={visible} onClose={() => setVisible(false)}>
        <h2>Modal Title</h2>
        <p>This is a modal with locked background scroll.</p>
        <p>Try scrolling - the background won't move!</p>
      </Modal>
    </div>
  );
};
```

## API

```typescript
useScrollLocker(lock?: boolean): void
```

### Params

| Property | Description                                    | Type      | Default |
| -------- | ---------------------------------------------- | --------- | ------- |
| lock     | Whether to lock the scroll. When `true`, body scrolling is disabled. | `boolean` | `false` |

### How It Works

1. **Scroll Detection**: Checks if the body content overflows the viewport
2. **Scrollbar Compensation**: Measures the scrollbar width and adds padding to prevent layout shift
3. **Style Injection**: Dynamically injects CSS to hide overflow and compensate for scrollbar
4. **Cleanup**: Automatically removes injected styles when lock is disabled or component unmounts

### Implementation Details

The hook:
- Uses `useLayoutEffect` to synchronously apply styles before browser paint
- Generates a unique ID for each instance to avoid conflicts
- Applies `overflow-y: hidden` to the body
- Calculates and compensates for scrollbar width to prevent layout shift
- Supports multiple concurrent locks (useful for nested modals)

## Notes

- The hook uses `useLayoutEffect` to ensure styles are applied synchronously before the browser paints
- Each hook instance gets a unique ID, so multiple instances can coexist
- The scrollbar width is calculated dynamically to support different browsers and operating systems
- Width compensation only applies when the body is actually overflowing

## TypeScript

```typescript
function useScrollLocker(lock?: boolean): void;
```
