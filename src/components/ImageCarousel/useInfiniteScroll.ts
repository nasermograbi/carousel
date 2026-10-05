import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import { remapPosition } from "./layout";

const MIN_TRACK_WIDTH = 1_000_000;
const SCROLL_IDLE_MS = 150;

const getCopyCount = (listWidth: number) =>
  listWidth > 0 ? Math.max(3, Math.ceil(MIN_TRACK_WIDTH / listWidth)) : 3;

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
  const copies = getCopyCount(listWidth);
  const middleStart = Math.floor(copies / 2) * listWidth;
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
      scroller.scrollLeft = middleStart + center - viewportWidth / 2;
    } else {
      scroller.scrollLeft = middleStart;
    }

    previous.current = {
      offsets,
      viewportWidth,
      scrollLeft: scroller.scrollLeft,
    };
    setScrollLeft(scroller.scrollLeft);
  }, [scrollerRef, offsets, viewportWidth, middleStart]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let idleTimer: number | undefined;

    const sync = () => {
      flushSync(() => setScrollLeft(scroller.scrollLeft));
      if (previous.current) previous.current.scrollLeft = scroller.scrollLeft;
    };

    // Same content, moved back into the middle copy.
    const recenter = () => {
      scroller.scrollLeft = middleStart + (scroller.scrollLeft % listWidth);
      sync();
    };

    const onScroll = () => {
      sync();

      // Jumping mid-scroll would cancel momentum on iOS, so wait until
      // scrolling stops. Only jump right away if an end is close.
      const edge = scroller.clientWidth * 2;
      const maxScrollLeft = listWidth * copies - scroller.clientWidth;
      if (
        scroller.scrollLeft < edge ||
        scroller.scrollLeft > maxScrollLeft - edge
      ) {
        recenter();
      }

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        const isInMiddle =
          scroller.scrollLeft >= middleStart &&
          scroller.scrollLeft < middleStart + listWidth;
        if (!isInMiddle) recenter();
      }, SCROLL_IDLE_MS);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(idleTimer);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [scrollerRef, listWidth, copies, middleStart]);

  return { scrollLeft, copies };
};
