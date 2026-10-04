import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import type { ImageCarouselItem } from "../types/carousel";

type ImageCarouselProps = {
  items: ImageCarouselItem[];
};

const LIST_COPIES = 3;
const GAP = 32;
const OVERSCAN = 1000;

const useElementSize = (ref: RefObject<HTMLElement | null>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () =>
      setSize({ width: element.clientWidth, height: element.clientHeight });

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
};

const getDisplayWidth = (rowHeight: number, item: ImageCarouselItem) =>
  rowHeight * (item.width / item.height);

const getItemOffsets = (rowHeight: number, items: ImageCarouselItem[]) => {
  const offsets = [0];
  for (const item of items) {
    const lastOffset = offsets[offsets.length - 1];
    offsets.push(lastOffset + getDisplayWidth(rowHeight, item) + GAP);
  }
  return offsets;
};

export const ImageCarousel = ({ items }: ImageCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const { width: viewportWidth, height: rowHeight } =
    useElementSize(scrollerRef);

  const offsets = useMemo(
    () => getItemOffsets(rowHeight, items),
    [rowHeight, items],
  );
  const listWidth = offsets[items.length];

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollLeft = listWidth;
    setScrollLeft(scroller.scrollLeft);
  }, [listWidth]);

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
  }, [listWidth]);

  return (
    <div className="h-[60vh] overflow-x-auto" ref={scrollerRef}>
      <div
        className="relative h-full"
        style={{ width: listWidth * LIST_COPIES }}
      >
        {Array.from({ length: LIST_COPIES }, (_, copyIndex) =>
          items.map((item, index) => {
            const left = copyIndex * listWidth + offsets[index];
            const width = getDisplayWidth(rowHeight, item);
            const isNearScreen =
              // The item ends after the window starts...
              left + width > scrollLeft - OVERSCAN &&
              // ...and starts before the window ends.
              left < scrollLeft + viewportWidth + OVERSCAN;

            if (!isNearScreen) return null;

            return (
              <figure
                key={`${copyIndex}-${item.id}`}
                className="absolute top-0"
                style={{ left, width }}
              >
                <img
                  className="object-cover"
                  style={{ width, height: rowHeight }}
                  src={item.src}
                  alt={item.alt}
                />
                {/* Overlaid, so it takes no height from the row. Hidden from
                    screen readers, since it repeats the alt text. */}
                <figcaption
                  className="absolute bottom-0 p-2 text-sm text-white"
                  aria-hidden="true"
                >
                  {item.alt}
                </figcaption>
              </figure>
            );
          }),
        )}
      </div>
    </div>
  );
};
