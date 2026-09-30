import type { ImageCarouselItem } from "../types/carousel";

type PicsumImage = {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
};

export async function fetchImages(): Promise<ImageCarouselItem[]> {
  const response = await fetch("https://picsum.photos/v2/list?limit=10");
  const data: PicsumImage[] = await response.json();

  return data.map(toCarouselImage);
}

const toCarouselImage = (image: PicsumImage): ImageCarouselItem => ({
  id: image.id,
  width: image.width,
  height: image.height,
  src: image.download_url,
  alt: `Photo by ${image.author}`,
});
