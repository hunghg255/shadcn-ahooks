import {
  useCallback,
  useRef,
  useImperativeHandle,
  // useEffectEvent,
} from 'react';

function useCallbackEvent<T extends (...args: unknown[]) => unknown>(
  callback: T
) {
  const property = useRef<{ callback: T }>(null);

  useImperativeHandle(property, () => ({ callback }));

  return useCallback((...args: Parameters<T>) => {
    if (!property.current) throw 'callback is null';
    return property.current.callback(...args);
  }, []);
}

export default useCallbackEvent;
