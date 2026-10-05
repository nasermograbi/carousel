import { useMemo, useRef } from "react";
import { useElementSize } from "../../hooks/useElementSize";
import { useHorizontalWheel } from "../../hooks/useHorizontalWheel";
import type { ImageCarouselItem, ImageSrcResolver } from "../../types/carousel";
import { getDisplaySize, getItemOffsets } from "./layout";
import { useInfiniteScroll } from "./useInfiniteScroll";

type ImageCarouselProps = {
  items: ImageCarouselItem[];
  getImageSrc: ImageSrcResolver;
  className?: string;
};

const OVERSCAN = 1000;
const MAX_ITEM_WIDTH_RATIO = 0.9;
const SIZE_STEP = 100;

const getRequestSize = (item: ImageCarouselItem, displayHeight: number) => {
  const height =
    Math.ceil((displayHeight * window.devicePixelRatio) / SIZE_STEP) *
    SIZE_STEP;
  return { width: Math.round((height * item.width) / item.height), height };
};

export const ImageCarousel = ({
  items,
  getImageSrc,
  className,
}: ImageCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { width: viewportWidth, height: rowHeight } =
    useElementSize(scrollerRef);
  const maxItemWidth = viewportWidth * MAX_ITEM_WIDTH_RATIO;

  const offsets = useMemo(
    () => getItemOffsets(rowHeight, maxItemWidth, items),
    [rowHeight, maxItemWidth, items],
  );
  const listWidth = offsets[items.length];
  const { scrollLeft, copies } = useInfiniteScroll(
    scrollerRef,
    offsets,
    viewportWidth,
  );
  useHorizontalWheel(scrollerRef);

  return (
    <div
      className={`overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden ${className ?? ""}`}
      ref={scrollerRef}
    >
      <div className="relative h-full" style={{ width: listWidth * copies }}>
        {rowHeight > 0 &&
          Array.from({ length: copies }, (_, copyIndex) =>
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
                  className="absolute overflow-hidden rounded-lg"
                  style={{ left, top: (rowHeight - height) / 2, width }}
                >
                  <img
                    className="bg-neutral-200 object-cover"
                    style={{ width, height }}
                    src={getImageSrc(item, getRequestSize(item, height))}
                    alt={item.alt}
                  />
                  <figcaption
                    className="absolute inset-x-0 bottom-0 truncate bg-linear-to-t from-black/60 to-transparent px-3 pt-8 pb-2 text-xs font-medium text-white"
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
