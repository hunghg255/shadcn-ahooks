---
nav:
  path: /hooks
---

# useSSE

A hook for handling Server-Sent Events (SSE) connections with automatic lifecycle management, connection control, and error handling.

## Features

- 🔌 Automatic connection management on mount/unmount
- 🔄 Manual reconnection support
- 📡 Connection state tracking (connecting, open, closed)
- 🛡️ Built-in error handling
- 🎯 AbortController integration for clean cancellation
- 🌐 Support for POST requests with body data
- 🔧 Custom fetch function support
- 👁️ Background tab behavior control

## When to Use

- Real-time data streaming from server
- Chat applications and live notifications
- Live updates and dashboards
- Progress tracking for long-running operations
- Any scenario requiring server-push updates

## Usage

```tsx
import { useSSE } from 'ahooks';

function LiveFeed() {
  const { readyState, close, reconnect } = useSSE({
    url: '/api/events',
    onMessage: (message) => {
      console.log('Received:', message.data);
    },
  });

  return (
    <div>
      Status: {readyState === 1 ? 'Connected' : 'Disconnected'}
      <button onClick={close}>Disconnect</button>
      <button onClick={reconnect}>Reconnect</button>
    </div>
  );
}
```

## Examples

### Basic Real-time Updates

```tsx
import React, { useState } from 'react';
import { useSSE } from 'ahooks';

export default () => {
  const [messages, setMessages] = useState<string[]>([]);

  const { readyState, close, reconnect } = useSSE({
    url: '/api/stream',
    onMessage: (message) => {
      setMessages((prev) => [...prev, message.data]);
    },
    onOpen: (response) => {
      console.log('Connection opened:', response.status);
    },
    onError: (error) => {
      console.error('Connection error:', error);
    },
  });

  const statusText = readyState === 0 ? 'Connecting...' : readyState === 1 ? '🟢 Connected' : '🔴 Disconnected';

  return (
    <div>
      <div>Status: {statusText}</div>
      <button onClick={close}>Close</button>
      <button onClick={reconnect}>Reconnect</button>

      <div style={{ marginTop: '20px' }}>
        <h3>Messages:</h3>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
    </div>
  );
};
```

### Chat Application

```tsx
import React, { useState } from 'react';
import { useSSE } from 'ahooks';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export default () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  const { readyState } = useSSE({
    url: '/api/chat/stream',
    headers: {
      'Authorization': 'Bearer your-token',
    },
    onMessage: (message) => {
      const chatMessage = JSON.parse(message.data) as ChatMessage;
      setMessages((prev) => [...prev, chatMessage]);
    },
  });

  const sendMessage = () => {
    fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText }),
    });
    setInputText('');
  };

  return (
    <div>
      <div>Connection: {readyState === 1 ? '🟢 Online' : '🔴 Offline'}</div>

      <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px' }}>
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
```

### Progress Tracking

```tsx
import React, { useState } from 'react';
import { useSSE } from 'ahooks';

interface ProgressEvent {
  progress: number;
  status: string;
  message?: string;
}

export default () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const { readyState, reconnect } = useSSE({
    url: '/api/process/progress',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ taskId: '12345' }),
    onMessage: (msg) => {
      const event = JSON.parse(msg.data) as ProgressEvent;
      setProgress(event.progress);
      setStatus(event.status);
      setMessage(event.message || '');
    },
  });

  return (
    <div>
      <h3>Task Progress</h3>
      <div>Status: {status}</div>
      <div>
        <progress value={progress} max={100} style={{ width: '100%' }} />
        <span>{progress}%</span>
      </div>
      {message && <div>Message: {message}</div>}
      {readyState === 2 && (
        <button onClick={reconnect}>Retry</button>
      )}
    </div>
  );
};
```

### Live Dashboard with Custom Headers

```tsx
import React, { useState } from 'react';
import { useSSE } from 'ahooks';

export default () => {
  const [metrics, setMetrics] = useState({ users: 0, requests: 0, errors: 0 });

  const { readyState, close, reconnect } = useSSE({
    url: 'https://api.example.com/metrics/stream',
    headers: {
      'Authorization': 'Bearer your-api-token',
      'X-Client-Id': 'dashboard-001',
    },
    openWhenHidden: false, // Pause when tab is hidden
    onMessage: (message) => {
      const data = JSON.parse(message.data);
      setMetrics(data);
    },
  });

  return (
    <div>
      <h2>Live Metrics</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <h3>Active Users</h3>
          <div style={{ fontSize: '2em' }}>{metrics.users}</div>
        </div>
        <div>
          <h3>Requests/min</h3>
          <div style={{ fontSize: '2em' }}>{metrics.requests}</div>
        </div>
        <div>
          <h3>Errors</h3>
          <div style={{ fontSize: '2em', color: 'red' }}>{metrics.errors}</div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={close} disabled={readyState !== 1}>Stop</button>
        <button onClick={reconnect} disabled={readyState === 1}>Start</button>
      </div>
    </div>
  );
};
```

## API

```typescript
const { readyState, close, reconnect } = useSSE(options);
```

### Options

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| url | The SSE endpoint URL | `string` | - (required) |
| headers | Custom HTTP headers | `Record<string, string>` | `undefined` |
| method | HTTP method (GET or POST) | `string` | `'GET'` |
| body | Request body for POST requests | `string \| FormData` | `undefined` |
| onMessage | Callback when a message is received | `(message: EventSourceMessage) => void` | `undefined` |
| onOpen | Callback when connection opens | `(response: Response) => void` | `undefined` |
| onError | Callback when an error occurs | `(error: unknown) => void` | `undefined` |
| fetch | Custom fetch function | `typeof window.fetch` | `window.fetch` |
| openWhenHidden | Keep connection open when tab is hidden | `boolean` | `true` |

### Result

| Property | Description | Type |
| --- | --- | --- |
| readyState | Connection state: `0` (connecting), `1` (open), `2` (closed) | `number` |
| close | Function to close the connection | `() => void` |
| reconnect | Function to reconnect | `() => void` |

### EventSourceMessage

```typescript
interface EventSourceMessage {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
}
```

## How It Works

1. **Auto-Connection**: Automatically connects when component mounts
2. **State Management**: Tracks connection state through `readyState`
3. **Abort Control**: Uses AbortController for clean connection cancellation
4. **Reconnection**: Provides manual reconnect function that aborts old connection first
5. **Cleanup**: Automatically closes connection on unmount
6. **Dependency Tracking**: Reconnects when options change

### ReadyState Values

- `0`: Connecting - Initial connection attempt in progress
- `1`: Open - Connection established and ready
- `2`: Closed - Connection closed (error or manual close)

## Notes

- The hook automatically reconnects when any of the options change
- Uses `@microsoft/fetch-event-source` library for robust SSE handling
- Supports POST requests with body data, unlike native EventSource
- Custom headers can be provided for authentication
- `openWhenHidden` controls whether the connection stays open when the browser tab is hidden
- The connection is automatically cleaned up when the component unmounts
- Use `close()` to manually terminate the connection
- Use `reconnect()` to re-establish a closed connection

## TypeScript

```typescript
interface UseSSEOptions {
  url: string;
  headers?: Record<string, string>;
  method?: string;
  body?: string | FormData;
  onMessage?: (message: EventSourceMessage) => void;
  onOpen?: (response: Response) => void;
  onError?: (error: unknown) => void;
  fetch?: typeof window.fetch;
  openWhenHidden?: boolean;
}

interface UseSSEResult {
  readyState: number;
  close: () => void;
  reconnect: () => void;
}

function useSSE(options: UseSSEOptions): UseSSEResult;
```
