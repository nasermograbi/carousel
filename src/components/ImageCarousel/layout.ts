import type { ImageCarouselItem } from "../../types/carousel";

const GAP = 32;

export const getDisplaySize = (
  rowHeight: number,
  maxWidth: number,
  item: ImageCarouselItem,
) => {
  const aspectRatio = item.width / item.height;
  const width = Math.round(Math.min(rowHeight * aspectRatio, maxWidth));
  return { width, height: Math.round(width / aspectRatio) };
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

export const getItemOffsets = (
  rowHeight: number,
  maxWidth: number,
  items: ImageCarouselItem[],
) => {
  const offsets = [0];
  for (const item of items) {
    const lastOffset = offsets[offsets.length - 1];
    const { width } = getDisplaySize(rowHeight, maxWidth, item);
    offsets.push(lastOffset + width + GAP);
  }
  return offsets;
};
