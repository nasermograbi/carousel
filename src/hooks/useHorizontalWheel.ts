import { useEffect, type RefObject } from "react";

export const useHorizontalWheel = (ref: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      element.scrollLeft += e.deltaY;
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [ref]);
};
