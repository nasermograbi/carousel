import type { ImageCarouselItem, ImageSrcResolver } from "../types/carousel";

type PicsumImage = {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
};

// The list endpoint returns at most 100 images per page.
const PAGE_SIZE = 100;

const fetchPage = async (
  page: number,
  limit: number,
): Promise<PicsumImage[]> => {
  const response = await fetch(
    `https://picsum.photos/v2/list?page=${page}&limit=${limit}`,
  );
  if (!response.ok) {
    throw new Error(`Picsum request failed with status ${response.status}`);
  }
  return response.json();
};

export async function fetchImages(count: number): Promise<ImageCarouselItem[]> {
  const pageSize = Math.min(count, PAGE_SIZE);
  const pageCount = Math.ceil(count / pageSize);
  const pages = await Promise.all(
    Array.from({ length: pageCount }, (_, i) => fetchPage(i + 1, pageSize)),
  );
  const catalogue = pages.flat();
  if (catalogue.length === 0) throw new Error("Picsum returned no images");

  return Array.from({ length: count }, (_, i) =>
    toCarouselImage(catalogue[i % catalogue.length], i),
  );
}

export const getPicsumSrc: ImageSrcResolver = (item, { width, height }) =>
  `https://picsum.photos/id/${item.id}/${width}/${height}.webp`;

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
    alt: `Photo by ${image.author}`,
  };
};
