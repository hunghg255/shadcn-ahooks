---
nav:
  path: /hooks
---

# useWebHaptics

A React hook for triggering haptic feedback on the web using the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API), with built-in preset patterns inspired by iOS haptic feedback styles and PWM-based intensity modulation.

## Features

- 📳 Cross-browser haptic feedback via the Vibration API
- 🎛️ PWM intensity modulation for fine-grained vibration control
- 🎨 Built-in presets mirroring iOS haptic styles (`success`, `warning`, `error`, `light`, `medium`, `heavy`, `soft`, `rigid`, `selection`, `nudge`, `buzz`)
- 🔢 Flexible input: preset name, duration number, `number[]` pattern, or custom `Vibration[]`
- 🐛 Debug mode with audio simulation for desktop development
- 🧹 Automatic cleanup on unmount

## When to Use

- Button press / tap feedback in mobile web apps
- Form validation feedback (success, error, warning)
- Game interactions and UI transitions
- Any scenario where tactile feedback enhances UX on supported devices

## Usage

```tsx
import { useWebHaptics } from "ahooks";

function App() {
  const { trigger, cancel, isSupported } = useWebHaptics();

  return (
    <div>
      <p>Haptics supported: {isSupported ? "Yes" : "No"}</p>
      <button onClick={() => trigger("success")}>Success</button>
      <button onClick={() => trigger("error")}>Error</button>
      <button onClick={cancel}>Cancel</button>
    </div>
  );
}
```

## Examples

### Basic Presets

```tsx
import React from "react";
import { useWebHaptics } from "ahooks";

export default () => {
  const { trigger, isSupported } = useWebHaptics();

  const presets = [
    "success",
    "warning",
    "error",
    "light",
    "medium",
    "heavy",
    "soft",
    "rigid",
    "selection",
    "nudge",
    "buzz",
  ] as const;

  return (
    <div>
      <p>Vibration API supported: {isSupported ? "✅ Yes" : "❌ No"}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {presets.map((name) => (
          <button key={name} onClick={() => trigger(name)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Custom Duration

```tsx
import React from "react";
import { useWebHaptics } from "ahooks";

export default () => {
  const { trigger } = useWebHaptics();

  return (
    <div>
      <button onClick={() => trigger(100)}>Vibrate 100ms</button>
      <button onClick={() => trigger(500)}>Vibrate 500ms</button>
    </div>
  );
};
```

### Custom Pattern with Intensity

```tsx
import React from "react";
import { useWebHaptics } from "ahooks";

export default () => {
  const { trigger } = useWebHaptics();

  const customPattern = [
    { duration: 50, intensity: 1.0 },
    { delay: 100, duration: 30, intensity: 0.5 },
    { delay: 100, duration: 80, intensity: 0.8 },
  ];

  return (
    <div>
      <button onClick={() => trigger(customPattern)}>Custom Pattern</button>
      <button onClick={() => trigger(customPattern, { intensity: 0.3 })}>
        Custom (low intensity)
      </button>
    </div>
  );
};
```

### Number Array Pattern

```tsx
import React from "react";
import { useWebHaptics } from "ahooks";

export default () => {
  const { trigger } = useWebHaptics();

  // number[] shorthand: alternating on/off durations (ms)
  return (
    <div>
      <button onClick={() => trigger([100, 50, 100])}>
        On 100ms → Off 50ms → On 100ms
      </button>
      <button onClick={() => trigger([200, 100, 200, 100, 200])}>
        Triple pulse
      </button>
    </div>
  );
};
```

### Debug Mode with Audio Simulation

```tsx
import React, { useState } from "react";
import { useWebHaptics } from "ahooks";

export default () => {
  const [debug, setDebug] = useState(true);
  const { trigger } = useWebHaptics({ debug });

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={debug}
          onChange={(e) => setDebug(e.target.checked)}
        />
        Debug mode (audio feedback)
      </label>
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={() => trigger("success")}>Success</button>
        <button onClick={() => trigger("error")}>Error</button>
        <button onClick={() => trigger("heavy")}>Heavy</button>
      </div>
    </div>
  );
};
```

### Cancel Ongoing Vibration

```tsx
import React from "react";
import { useWebHaptics } from "ahooks";

export default () => {
  const { trigger, cancel } = useWebHaptics();

  return (
    <div>
      <button onClick={() => trigger("buzz")}>Start Buzz (1s)</button>
      <button onClick={cancel}>Cancel</button>
    </div>
  );
};
```

## API

```typescript
const { trigger, cancel, isSupported } = useWebHaptics(options?);
```

### Options

| Property   | Description                                                 | Type      | Default |
| ---------- | ----------------------------------------------------------- | --------- | ------- |
| debug      | Enable debug mode with audio simulation for desktop testing | `boolean` | `false` |
| showSwitch | Show a fixed-position toggle switch for haptic feedback     | `boolean` | `false` |

### Result

| Property    | Description                                                   | Type                                                                            |
| ----------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| trigger     | Trigger haptic feedback with optional input and options       | `(input?: HapticInput, options?: TriggerOptions) => Promise<void> \| undefined` |
| cancel      | Cancel any ongoing vibration                                  | `() => void`                                                                    |
| isSupported | Whether the Vibration API is supported in the current browser | `boolean`                                                                       |

### HapticInput

The `trigger` function accepts flexible input types:

| Type           | Description                                                    | Example                                                  |
| -------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| `number`       | Single vibration duration in milliseconds                      | `trigger(100)`                                           |
| `string`       | Built-in preset name                                           | `trigger('success')`                                     |
| `number[]`     | Alternating on/off durations (ms)                              | `trigger([100, 50, 100])`                                |
| `Vibration[]`  | Array of vibration objects with duration, intensity, and delay | `trigger([{ duration: 50, intensity: 0.8 }])`            |
| `HapticPreset` | Object with a `pattern` property containing `Vibration[]`      | `trigger({ pattern: [{ duration: 30, intensity: 1 }] })` |

### TriggerOptions

| Property  | Description                                                         | Type     | Default |
| --------- | ------------------------------------------------------------------- | -------- | ------- |
| intensity | Default intensity for vibrations that don't specify their own (0–1) | `number` | `0.5`   |

### Built-in Presets

| Preset      | Category     | Description                                        |
| ----------- | ------------ | -------------------------------------------------- |
| `success`   | Notification | Ascending double-tap indicating success            |
| `warning`   | Notification | Two taps with hesitation indicating a warning      |
| `error`     | Notification | Three rapid harsh taps indicating an error         |
| `light`     | Impact       | Single light tap for minor interactions            |
| `medium`    | Impact       | Moderate tap for standard interactions             |
| `heavy`     | Impact       | Strong tap for significant interactions            |
| `soft`      | Impact       | Soft, cushioned tap with a rounded feel            |
| `rigid`     | Impact       | Hard, crisp tap with a precise feel                |
| `selection` | Selection    | Subtle tap for selection changes                   |
| `nudge`     | Custom       | Two quick taps with a pause, for nudge or reminder |
| `buzz`      | Custom       | Rapid, low-intensity sustained buzzing effect      |

## How It Works

1. **Vibration API**: On supported devices, `navigator.vibrate()` is called with a computed pattern
2. **PWM Modulation**: Intensity values (0–1) are translated to pulse-width modulation patterns, alternating short on/off cycles to simulate variable intensity
3. **Fallback**: On unsupported devices (desktop), a DOM-based checkbox toggle and optional audio simulation provide visual/audio feedback for testing
4. **Lifecycle**: The `WebHaptics` instance is created on mount and destroyed on unmount, cleaning up DOM elements and audio context

## Notes

- The Vibration API is primarily supported on Android Chrome; iOS Safari does not support it
- Duration per vibration phase is capped at 1000ms
- Debug mode uses Web Audio API to synthesize click sounds that approximate haptic feedback
- The `showSwitch` option renders a fixed-position label/checkbox in the DOM for visual feedback
- The hook instance is stable across re-renders; only `debug` and `showSwitch` react to option changes
- `isSupported` is a static value determined at module load time

## TypeScript

```typescript
interface Vibration {
  duration: number;
  intensity?: number;
  delay?: number;
}

type HapticPattern = number[] | Vibration[];

interface HapticPreset {
  pattern: Vibration[];
}

type HapticInput = number | string | HapticPattern | HapticPreset;

interface TriggerOptions {
  intensity?: number;
}

interface WebHapticsOptions {
  debug?: boolean;
  showSwitch?: boolean;
}

interface UseWebHapticsResult {
  trigger: (
    input?: HapticInput,
    options?: TriggerOptions
  ) => Promise<void> | undefined;
  cancel: () => void;
  isSupported: boolean;
}

function useWebHaptics(options?: WebHapticsOptions): UseWebHapticsResult;
```
