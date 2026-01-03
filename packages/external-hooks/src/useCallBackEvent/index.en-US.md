---
nav:
  path: /hooks
---

# useCallBackEvent

A hook that ensures callback functions always reference the latest version without causing component re-renders, similar to React's experimental `useEffectEvent`.

## Features

- ✅ Always calls the latest callback function
- 🎯 Stable function reference (doesn't change between renders)
- 🚀 Prevents unnecessary re-renders in child components
- 🔄 Solves closure issues with callbacks

## When to Use

- Event handlers passed to memoized child components
- Callbacks in `useEffect` that need access to latest state
- Functions passed to third-party libraries or event listeners
- Avoiding stale closure problems

## Usage

```tsx
import useCallbackEvent from 'ahooks';

function Component() {
  const [count, setCount] = useState(0);

  // The callback always has access to the latest count
  // but the function reference never changes
  const handleClick = useCallbackEvent(() => {
    console.log('Current count:', count);
  });

  return <ExpensiveChild onClick={handleClick} />;
}
```

## Examples

### Basic Usage - Solving Stale Closure

```tsx
import React, { useState, useCallback } from 'react';
import useCallbackEvent from 'ahooks';

export default () => {
  const [count, setCount] = useState(0);

  // ❌ Wrong: This will always log 0 because of stale closure
  const handleClickWrong = useCallback(() => {
    setTimeout(() => {
      console.log('Wrong count:', count); // Always 0!
    }, 3000);
  }, []); // Empty deps means it captures count = 0

  // ✅ Correct: This will always log the latest count
  const handleClickCorrect = useCallbackEvent(() => {
    setTimeout(() => {
      console.log('Correct count:', count); // Always latest!
    }, 3000);
  });

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={handleClickWrong}>
        Log count (wrong - after 3s)
      </button>
      <button onClick={handleClickCorrect}>
        Log count (correct - after 3s)
      </button>
      <p>Click increment a few times, then click one of the log buttons</p>
    </div>
  );
};
```

### Preventing Re-renders with Memoized Children

```tsx
import React, { useState, useCallback, memo } from 'react';
import useCallbackEvent from 'ahooks';

const ExpensiveChild = memo(({ onClick, label }) => {
  console.log('ExpensiveChild rendered!');
  return <button onClick={onClick}>{label}</button>;
});

export default () => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Hello');

  // ❌ Without useCallbackEvent: Child re-renders when message changes
  const handleWithUseCallback = useCallback(() => {
    console.log('Count:', count, 'Message:', message);
  }, [count, message]); // Dependencies cause re-creation

  // ✅ With useCallbackEvent: Child never re-renders
  const handleWithCallbackEvent = useCallbackEvent(() => {
    console.log('Count:', count, 'Message:', message);
  }); // Stable reference, always latest values

  return (
    <div>
      <p>Count: {count}</p>
      <p>Message: {message}</p>

      <button onClick={() => setCount(count + 1)}>
        Increment Count
      </button>
      <button onClick={() => setMessage(message + '!')}>
        Change Message
      </button>

      <div style={{ marginTop: 20 }}>
        <ExpensiveChild
          onClick={handleWithUseCallback}
          label="useCallback (re-renders)"
        />
        <ExpensiveChild
          onClick={handleWithCallbackEvent}
          label="useCallbackEvent (stable)"
        />
      </div>

      <p style={{ fontSize: 12, color: 'gray' }}>
        Open console to see when ExpensiveChild re-renders
      </p>
    </div>
  );
};
```

### With Event Listeners

```tsx
import React, { useState, useEffect } from 'react';
import useCallbackEvent from 'ahooks';

export default () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState('blue');

  // Always has access to latest color without re-adding listener
  const handleMouseMove = useCallbackEvent((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
    console.log('Current color:', color); // Always latest!
  });

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []); // Empty deps - listener never re-added!

  return (
    <div style={{ padding: 20 }}>
      <p>Mouse position: X: {position.x}, Y: {position.y}</p>
      <p>Current color: <span style={{ color }}>{color}</span></p>

      <button onClick={() => setColor(color === 'blue' ? 'red' : 'blue')}>
        Toggle Color
      </button>

      <p style={{ fontSize: 12, color: 'gray' }}>
        Move your mouse around. The callback sees the latest color
        even though the event listener was only added once!
      </p>
    </div>
  );
};
```

### With Third-Party Libraries

```tsx
import React, { useState, useEffect, useRef } from 'react';
import useCallbackEvent from 'ahooks';

export default () => {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Simulating a third-party library that stores callbacks
  const libraryRef = useRef({
    callbacks: [] as Function[],
    registerCallback(cb: Function) {
      this.callbacks.push(cb);
    },
    executeCallbacks() {
      this.callbacks.forEach(cb => cb());
    }
  });

  const handleEvent = useCallbackEvent(() => {
    const log = `Event triggered! Count: ${count}`;
    setLogs(prev => [...prev, log]);
  });

  useEffect(() => {
    // Register callback only once with the library
    libraryRef.current.registerCallback(handleEvent);
  }, []); // handleEvent is stable, so this only runs once

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => libraryRef.current.executeCallbacks()}>
        Trigger Library Callbacks
      </button>

      <div style={{ marginTop: 20 }}>
        <h4>Logs:</h4>
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: 'gray' }}>
        Increment the count, then trigger callbacks.
        The callback sees the latest count even though
        it was registered only once!
      </p>
    </div>
  );
};
```

## API

```typescript
const stableCallback = useCallbackEvent<T>(callback: T): T
```

### Params

| Property | Description                                   | Type                                 | Required |
| -------- | --------------------------------------------- | ------------------------------------ | -------- |
| callback | The callback function to wrap                 | `(...args: any[]) => any`           | Yes      |

### Result

| Property       | Description                                                          | Type                      |
| -------------- | -------------------------------------------------------------------- | ------------------------- |
| stableCallback | A stable function reference that always calls the latest callback    | `(...args: any[]) => any` |

## Comparison with Other Approaches

### vs `useCallback`

```tsx
// useCallback: Need to include all dependencies
const callback = useCallback(() => {
  console.log(stateA, stateB, stateC);
}, [stateA, stateB, stateC]); // Re-creates when any dep changes

// useCallbackEvent: Always stable, always latest
const callback = useCallbackEvent(() => {
  console.log(stateA, stateB, stateC);
}); // Never re-creates
```

### vs `useRef`

```tsx
// useRef: Manual management, verbose
const callbackRef = useRef(callback);
useEffect(() => {
  callbackRef.current = callback;
}, [callback]);
const stableCallback = useCallback((...args) => {
  return callbackRef.current(...args);
}, []);

// useCallbackEvent: Simple and clean
const stableCallback = useCallbackEvent(callback);
```

## How It Works

1. **Stores Latest Callback**: Uses `useImperativeHandle` to store the current callback
2. **Stable Wrapper**: Returns a memoized function (via `useCallback` with empty deps)
3. **Latest Execution**: The wrapper always calls the stored latest callback
4. **No Re-creation**: The returned function reference never changes

## Notes

- This is similar to React's experimental `useEffectEvent` hook (not yet stable)
- The returned function reference is stable and won't cause re-renders
- The callback always has access to the latest props, state, and context
- Perfect for event handlers, callbacks in effects, and third-party library integrations
- Throws an error if called when the callback reference is null (edge case protection)

## TypeScript

```typescript
function useCallbackEvent<T extends (...args: unknown[]) => unknown>(
  callback: T
): (...args: Parameters<T>) => ReturnType<T>;
```

The hook is fully typed and preserves the callback's parameter and return types.
