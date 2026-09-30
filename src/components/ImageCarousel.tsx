import { useEffect, useLayoutEffect, useRef } from "react";
import type { ImageCarouselItem } from "../types/carousel";

type ImageCarouselProps = {
  items: ImageCarouselItem[];
};

const LIST_COPIES = 3;

const measureListWidth = (scroller: HTMLElement, itemCount: number) => {
  const firstItem = scroller.children[0] as HTMLElement;
  const firstItemOfSecondCopy = scroller.children[itemCount] as HTMLElement;

  return firstItemOfSecondCopy.offsetLeft - firstItem.offsetLeft;
};

export const ImageCarousel = ({ items }: ImageCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemCount = items.length;

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollLeft = measureListWidth(scroller, itemCount);
  }, [itemCount]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const onScroll = () => {
      console.log(scroller.scrollLeft);
      const listWidth = measureListWidth(scroller, itemCount);
      if (scroller.scrollLeft < listWidth) {
        scroller.scrollLeft += listWidth;
      } else if (scroller.scrollLeft >= listWidth * 2) {
        scroller.scrollLeft -= listWidth;
      }
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [itemCount]);

  return (
    <div className="flex gap-8 overflow-x-auto" ref={scrollerRef}>
      {Array.from({ length: LIST_COPIES }, (_, copyIndex) =>
        items.map((item) => (
          <figure key={`${copyIndex}-${item.id}`} className="shrink-0">
            <img
              className="h-125 object-cover"
              style={{ aspectRatio: `${item.width} / ${item.height}` }}
              src={item.src}
              alt={item.alt}
            />
            <figcaption className="mt-2 text-sm">{item.alt}</figcaption>
          </figure>
        )),
      )}
    </div>
  );
};
