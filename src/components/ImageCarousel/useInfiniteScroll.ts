import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import { remapPosition } from "./layout";

const getCopyCount = (listWidth: number, viewportWidth: number) =>
  listWidth > 0 ? 2 + Math.max(1, Math.ceil(viewportWidth / listWidth)) : 3;

type Snapshot = {
  offsets: number[];
  viewportWidth: number;
  scrollLeft: number;
};

export const useInfiniteScroll = (
  scrollerRef: RefObject<HTMLElement | null>,
  offsets: number[],
  viewportWidth: number,
) => {
  const listWidth = offsets[offsets.length - 1];
  const [scrollLeft, setScrollLeft] = useState(0);

  const previous = useRef<Snapshot | null>(null);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const prev = previous.current;

    const isResize =
      prev !== null &&
      prev.viewportWidth > 0 &&
      prev.offsets.length === offsets.length;

    if (isResize) {
      const prevListWidth = prev.offsets[prev.offsets.length - 1];
      const prevCenter =
        (prev.scrollLeft + prev.viewportWidth / 2) % prevListWidth;
      const center = remapPosition(prev.offsets, offsets, prevCenter);
      scroller.scrollLeft = listWidth + center - viewportWidth / 2;
    } else {
      scroller.scrollLeft = listWidth;
    }

    previous.current = {
      offsets,
      viewportWidth,
      scrollLeft: scroller.scrollLeft,
    };
    setScrollLeft(scroller.scrollLeft);
  }, [scrollerRef, offsets, viewportWidth, listWidth]);

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
      if (previous.current) previous.current.scrollLeft = scroller.scrollLeft;
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [scrollerRef, listWidth]);

  return { scrollLeft, copies: getCopyCount(listWidth, viewportWidth) };
};
