import type { ImageCarouselItem } from "../../types/carousel";

const GAP = 16;

type Size = { width: number; height: number };

export type Layout = {
  sizes: Size[];
  offsets: number[];
};

export type VisibleItem = Size & {
  key: string;
  index: number;
  left: number;
};

const getDisplaySize = (
  rowHeight: number,
  maxWidth: number,
  item: ImageCarouselItem,
): Size => {
  const aspectRatio = item.width / item.height;
  const width = Math.round(Math.min(rowHeight * aspectRatio, maxWidth));
  return { width, height: Math.round(width / aspectRatio) };
};

export const getLayout = (
  rowHeight: number,
  maxWidth: number,
  items: ImageCarouselItem[],
): Layout => {
  const sizes = items.map((item) => getDisplaySize(rowHeight, maxWidth, item));
  const offsets = [0];
  for (const { width } of sizes) {
    offsets.push(offsets[offsets.length - 1] + width + GAP);
  }
  return { sizes, offsets };
};

export const getVisibleItems = (
  { sizes, offsets }: Layout,
  copies: number,
  start: number,
  end: number,
): VisibleItem[] => {
  const listWidth = offsets[sizes.length];
  if (listWidth <= 0) return [];

  const firstCopy = Math.max(0, Math.floor(start / listWidth));
  const lastCopy = Math.min(copies - 1, Math.floor(end / listWidth));
  const visible: VisibleItem[] = [];

  for (let copy = firstCopy; copy <= lastCopy; copy++) {
    sizes.forEach((size, index) => {
      const left = copy * listWidth + offsets[index];
      // the item ends after the window starts and starts before it ends
      if (left + size.width > start && left < end) {
        visible.push({ ...size, key: `${copy}-${index}`, index, left });
      }
    });
  }
  return visible;
};

export const remapPosition = (
  oldOffsets: number[],
  newOffsets: number[],
  position: number,
) => {
  const index = oldOffsets.findLastIndex((offset) => offset <= position);
  const fraction =
    (position - oldOffsets[index]) /
    (oldOffsets[index + 1] - oldOffsets[index]);
  return (
    newOffsets[index] + fraction * (newOffsets[index + 1] - newOffsets[index])
  );
};
