import type { ImageCarouselItem } from "../../types/carousel";

const GAP = 32;

export const getDisplaySize = (
  rowHeight: number,
  maxWidth: number,
  item: ImageCarouselItem,
) => {
  const aspectRatio = item.width / item.height;
  const width = Math.min(rowHeight * aspectRatio, maxWidth);
  return { width, height: width / aspectRatio };
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
