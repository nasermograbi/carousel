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
  const response = await fetch("https://picsum.photos/v2/list?limit=100");
  const data: PicsumImage[] = await response.json();

  return data.map(toCarouselImage);
}

const TEST_SIZES = [
  { width: 1200, height: 800 }, // landscape 3:2
  { width: 800, height: 1200 }, // portrait 2:3
  { width: 1000, height: 1000 }, // square
  { width: 1600, height: 400 }, // panorama 4:1
  { width: 400, height: 1200 }, // tall 1:3
  { width: 1280, height: 720 }, // widescreen 16:9
];

const toCarouselImage = (
  image: PicsumImage,
  index: number,
): ImageCarouselItem => {
  const { width, height } = TEST_SIZES[index % TEST_SIZES.length];

  return {
    id: image.id,
    width,
    height,
    src: `https://picsum.photos/id/${image.id}/${width}/${height}`,
    alt: `Photo by ${image.author}`,
  };
};
