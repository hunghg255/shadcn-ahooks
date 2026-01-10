import { useState, useEffect, useRef, useCallback } from "react";
import { fetchEventSource, type EventSourceMessage } from "@microsoft/fetch-event-source";

export interface UseSSEOptions {
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

type TReadyState = 'CONNECTING' | 'OPEN' | 'CLOSED'; // 0: connecting, 1: open, 2: closed

export interface UseSSEResult {
  readyState: TReadyState;
  close: () => void;
  reconnect: () => void;
}

function useSSE(options: UseSSEOptions): UseSSEResult {
  const { url, headers, method, body, onMessage, onOpen, onError, fetch: customFetch, openWhenHidden } = options;
  const [readyState, setReadyState] = useState<TReadyState>('CONNECTING');
  const controllerRef = useRef<AbortController | null>(null);

  const connect = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    fetchEventSource(url, {
      method: method || 'GET',
      headers: headers,
      body: body,
      signal: controller.signal,
      fetch: customFetch,
      openWhenHidden: openWhenHidden ?? true,

      async onopen(response) {
        setReadyState('OPEN');
        onOpen?.(response);
      },

      onmessage(message) {
        onMessage?.(message);
      },

      onerror(err) {
        setReadyState('CLOSED');
        onError?.(err);
      },
    });
  }, [url, headers, method, body, openWhenHidden]);

  const close = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      setReadyState('CLOSED');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      close();
    };
  }, []);

  return {
    readyState,
    close,
    reconnect: connect,
  };
}

export default useSSE;
