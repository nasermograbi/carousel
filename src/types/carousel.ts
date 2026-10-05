export type ImageCarouselItem = {
  id: string;
  width: number;
  height: number;
  alt: string;
};

export type ImageSrcResolver = (
  item: ImageCarouselItem,
  size: { width: number; height: number },
) => string;
