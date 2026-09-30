import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ImageCarouselItem } from "../types/carousel";
import { flushSync } from "react-dom";

type ImageCarouselProps = {
  items: ImageCarouselItem[];
};

const LIST_COPIES = 3;
const ROW_HEIGHT = 500;
const GAP = 32;
const OVERSCAN = 1000;

const getItemOffsets = (items: ImageCarouselItem[]) => {
  const offsets = [0];
  for (const item of items) {
    const lastOffset = offsets[offsets.length - 1];
    offsets.push(lastOffset + getDisplayWidth(item) + GAP);
  }
  return offsets;
};

const getDisplayWidth = (item: ImageCarouselItem) =>
  ROW_HEIGHT * (item.width / item.height);

export const ImageCarousel = ({ items }: ImageCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ left: 0, width: 0 });

  const offsets = useMemo(() => getItemOffsets(items), [items]);
  const listWidth = offsets[items.length];

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollLeft = listWidth;

    setViewport({ left: scroller.scrollLeft, width: scroller.clientWidth });
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
      flushSync(() => {
        setViewport({ left: scroller.scrollLeft, width: scroller.clientWidth });
      });
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [listWidth]);

  return (
    <div className="overflow-x-auto" ref={scrollerRef}>
      <div
        className="relative h-140"
        style={{ width: listWidth * LIST_COPIES }}
      >
        {Array.from({ length: LIST_COPIES }, (_, copyIndex) =>
          items.map((item, index) => {
            const left = copyIndex * listWidth + offsets[index];
            const width = getDisplayWidth(item);
            const isNearScreen =
              // item right edge is past the window left edge
              left + width > viewport.left - OVERSCAN &&
              // item left edge is before the window right edge
              left < viewport.left + viewport.width + OVERSCAN;

            if (!isNearScreen) return null;

            return (
              <figure
                key={`${copyIndex}-${item.id}`}
                className="absolute top-0"
                style={{ left, width }}
              >
                <img
                  className="object-cover"
                  style={{ width, height: ROW_HEIGHT }}
                  src={item.src}
                  alt={item.alt}
                />
                <figcaption className="mt-2 text-sm">{item.alt}</figcaption>
              </figure>
            );
          }),
        )}
      </div>
    </div>
  );
};
