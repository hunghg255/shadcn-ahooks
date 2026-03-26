import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type RefObject,
} from "react";

export type ImageDecodeStatus =
  | "idle"
  | "loading"
  | "decoded"
  | "error"
  | "painted";

export interface UseImageDecodeOptions {
  /** Gọi khi ảnh đã decode xong trong bộ nhớ */
  onDecoded?: (el: HTMLImageElement) => void;
  /** Gọi khi ảnh đã render hết pixel lên màn hình */
  onPainted?: (el: HTMLImageElement) => void;
}

export interface UseImageDecodeReturn {
  status: ImageDecodeStatus;
  isLoading: boolean;
  isDecoded: boolean;
  isPainted: boolean;
  isError: boolean;
  error: string | null;
  naturalWidth: number;
  naturalHeight: number;
}

/**
 * useImageDecode
 *
 * Nhận một React ref gắn vào <img> element.
 * Tự động gọi HTMLImageElement.decode() mỗi khi src thay đổi,
 * sau đó dùng double rAF để xác định ảnh đã paint hết lên màn hình.
 *
 * Flow:
 *   src thay đổi (MutationObserver)
 *     → el.decode()        → onDecoded()
 *     → rAF #1 → rAF #2   → onPainted()  ✅
 *
 * @example
 * const imgRef = useRef<HTMLImageElement>(null)
 * const { isPainted } = useImageDecode(imgRef, {
 *   onPainted: (el) => console.log('render hết rồi!', el.naturalWidth)
 * })
 *
 * <img ref={imgRef} src="..." />
 */
function useImageDecode(
  imgRef: RefObject<HTMLImageElement>,
  options: UseImageDecodeOptions = {}
): UseImageDecodeReturn {
  // Dùng useRef để giữ callback ổn định, tránh trigger lại effect
  const onDecodedRef = useRef(options.onDecoded);
  const onPaintedRef = useRef(options.onPainted);
  onDecodedRef.current = options.onDecoded;
  onPaintedRef.current = options.onPainted;

  const [state, setState] = useState<
    Omit<
      UseImageDecodeReturn,
      "isLoading" | "isDecoded" | "isPainted" | "isError"
    > & {
      status: ImageDecodeStatus;
      isLoading: boolean;
      isDecoded: boolean;
      isPainted: boolean;
      isError: boolean;
      error: string | null;
      naturalWidth: number;
      naturalHeight: number;
    }
  >({
    status: "idle",
    isLoading: false,
    isDecoded: false,
    isPainted: false,
    isError: false,
    error: null,
    naturalWidth: 0,
    naturalHeight: 0,
  });

  const decode = useCallback(async (el: HTMLImageElement) => {
    // Dùng object ref để cancel async flow đang chạy
    const token = { cancelled: false };

    setState({
      status: "loading",
      isLoading: true,
      isDecoded: false,
      isPainted: false,
      isError: false,
      error: null,
      naturalWidth: 0,
      naturalHeight: 0,
    });

    let raf1 = 0;
    let raf2 = 0;

    const cancel = () => {
      token.cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };

    try {
      await el.decode();

      if (token.cancelled) return cancel;

      setState((prev) => ({
        ...prev,
        status: "decoded",
        isLoading: false,
        isDecoded: true,
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
      }));

      onDecodedRef.current?.(el);

      // Double rAF: đảm bảo pixel đã flush lên màn hình
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (token.cancelled) return;

          setState((prev) => ({
            ...prev,
            status: "painted",
            isPainted: true,
          }));

          onPaintedRef.current?.(el);
        });
      });
    } catch (err) {
      if (token.cancelled) return cancel;

      setState((prev) => ({
        ...prev,
        status: "error",
        isLoading: false,
        isError: true,
        error: err instanceof Error ? err.message : "Failed to decode image",
      }));
    }

    return cancel;
  }, []); // không deps vì dùng ref cho callbacks

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    let cancelDecode: (() => void) | undefined;

    // Decode ngay khi element mount
    decode(el).then((cancel) => {
      cancelDecode = cancel;
    });

    // Theo dõi thay đổi src
    const observer = new MutationObserver(() => {
      cancelDecode?.();
      decode(el).then((cancel) => {
        cancelDecode = cancel;
      });
    });
    observer.observe(el, { attributes: true, attributeFilter: ["src"] });

    return () => {
      cancelDecode?.();
      observer.disconnect();
    };
  }, [imgRef, decode]);

  return state;
}

export default useImageDecode;
