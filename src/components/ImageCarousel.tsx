import { useState } from "react";
import type { ImageCarouselItem } from "../types/carousel";

type ImageCarouselProps = {
  items: ImageCarouselItem[];
};

export const ImageCarousel = ({ items }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const current = items[currentIndex];

  return (
    <div className="flex h-screen items-center justify-center">
      <button
        className="mr-6 rounded-lg bg-blue-500 p-4 text-white"
        onClick={goToPrevious}
      >
        Previous
      </button>
      <div className="text-center">
        <img
          className="max-h-[70vh] max-w-[70vw] rounded-lg"
          src={current.src}
          alt={current.alt}
        />
        <p className="mt-2">{current.alt}</p>
      </div>
      <button
        className="ml-6 rounded-lg bg-blue-500 p-4 text-white"
        onClick={goToNext}
      >
        Next
      </button>
    </div>
  );
};
