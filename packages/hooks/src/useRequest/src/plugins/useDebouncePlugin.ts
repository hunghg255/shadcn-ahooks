import { debounce, type DebouncedFunc } from 'es-toolkit/compat';
import { useEffect, useMemo, useRef } from 'react';
import type { Plugin } from '../types';

interface DebounceSettings {
    /**
     * If `true`, the function will be invoked on the leading edge of the timeout.
     * @default false
     */
    leading?: boolean | undefined;
    /**
     * The maximum time `func` is allowed to be delayed before it's invoked.
     * @default Infinity
     */
    maxWait?: number | undefined;
    /**
     * If `true`, the function will be invoked on the trailing edge of the timeout.
     * @default true
     */
    trailing?: boolean | undefined;
}

const useDebouncePlugin: Plugin<any, any[]> = (
  fetchInstance,
  { debounceWait, debounceLeading, debounceTrailing, debounceMaxWait },
) => {
  const debouncedRef = useRef<DebouncedFunc<any>>(undefined);

  const options = useMemo(() => {
    const ret: DebounceSettings = {};
    if (debounceLeading !== undefined) {
      ret.leading = debounceLeading;
    }
    if (debounceTrailing !== undefined) {
      ret.trailing = debounceTrailing;
    }
    if (debounceMaxWait !== undefined) {
      ret.maxWait = debounceMaxWait;
    }
    return ret;
  }, [debounceLeading, debounceTrailing, debounceMaxWait]);

  useEffect(() => {
    if (debounceWait) {
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance);

      debouncedRef.current = debounce(
        (callback: (...args: any[]) => void) => {
          callback();
        },
        debounceWait,
        options,
      );

      // debounce runAsync should be promise
      // https://github.com/lodash/lodash/issues/4400#issuecomment-834800398
      fetchInstance.runAsync = (...args) => {
        return new Promise<void>((resolve, reject) => {
          debouncedRef.current?.(() => {
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject);
          });
        });
      };

      return () => {
        debouncedRef.current?.cancel();
        fetchInstance.runAsync = _originRunAsync;
      };
    }
  }, [debounceWait, options]);

  if (!debounceWait) {
    return {};
  }

  return {
    onCancel: () => {
      debouncedRef.current?.cancel();
    },
  };
};

export default useDebouncePlugin;
