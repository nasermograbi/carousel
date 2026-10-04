import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { flushSync } from "react-dom";

export const LIST_COPIES = 3;

export const useInfiniteScroll = (
  scrollerRef: RefObject<HTMLElement | null>,
  listWidth: number,
) => {
  const [scrollLeft, setScrollLeft] = useState(0);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollLeft = listWidth;
    setScrollLeft(scroller.scrollLeft);
  }, [scrollerRef, listWidth]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const onScroll = () => {
      if (scroller.scrollLeft < listWidth) {
        scroller.scrollLeft += listWidth;
      } else if (scroller.scrollLeft >= listWidth * 2) {
        scroller.scrollLeft -= listWidth;
      }
      flushSync(() => setScrollLeft(scroller.scrollLeft));
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [scrollerRef, listWidth]);

  return scrollLeft;
};
