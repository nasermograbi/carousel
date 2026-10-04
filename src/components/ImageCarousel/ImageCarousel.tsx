import { useMemo, useRef } from "react";
import { useElementSize } from "../../hooks/useElementSize";
import { useHorizontalWheel } from "../../hooks/useHorizontalWheel";
import type { ImageCarouselItem } from "../../types/carousel";
import { getDisplaySize, getItemOffsets } from "./layout";
import { LIST_COPIES, useInfiniteScroll } from "./useInfiniteScroll";

type ImageCarouselProps = {
  items: ImageCarouselItem[];
  className?: string;
};

const OVERSCAN = 1000;
const MAX_ITEM_WIDTH_RATIO = 0.9;

export const ImageCarousel = ({ items, className }: ImageCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { width: viewportWidth, height: rowHeight } =
    useElementSize(scrollerRef);
  const maxItemWidth = viewportWidth * MAX_ITEM_WIDTH_RATIO;

  const offsets = useMemo(
    () => getItemOffsets(rowHeight, maxItemWidth, items),
    [rowHeight, maxItemWidth, items],
  );
  const listWidth = offsets[items.length];
  const scrollLeft = useInfiniteScroll(scrollerRef, offsets, viewportWidth);
  useHorizontalWheel(scrollerRef);

  return (
    <div className={`overflow-x-auto ${className ?? ""}`} ref={scrollerRef}>
      <div
        className="relative h-full"
        style={{ width: listWidth * LIST_COPIES }}
      >
        {Array.from({ length: LIST_COPIES }, (_, copyIndex) =>
          items.map((item, index) => {
            const left = copyIndex * listWidth + offsets[index];
            const { width, height } = getDisplaySize(
              rowHeight,
              maxItemWidth,
              item,
            );
            const isNearScreen =
              // The item ends after the window starts...
              left + width > scrollLeft - OVERSCAN &&
              // ...and starts before the window ends.
              left < scrollLeft + viewportWidth + OVERSCAN;

            if (!isNearScreen) return null;

            return (
              <figure
                key={`${copyIndex}-${index}`}
                className="absolute"
                style={{ left, top: (rowHeight - height) / 2, width }}
              >
                <img
                  className="object-cover"
                  style={{ width, height }}
                  src={item.src}
                  alt={item.alt}
                />
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
