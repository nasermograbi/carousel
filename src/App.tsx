import { useEffect, useState } from "react";
import { ImageCarousel } from "./components/ImageCarousel/ImageCarousel";
import { fetchImages } from "./services/picsum";
import type { ImageCarouselItem } from "./types/carousel";

const IMAGE_COUNTS = [12, 1000];

function App() {
  const [count, setCount] = useState(IMAGE_COUNTS[0]);
  const [images, setImages] = useState<ImageCarouselItem[]>([]);

  useEffect(() => {
    let ignore = false;
    fetchImages(count).then((images) => {
      if (!ignore) setImages(images);
    });
    return () => {
      ignore = true;
    };
  }, [count]);

  return (
    <main className="py-8">
      <div className="mb-6 flex justify-center gap-2">
        {IMAGE_COUNTS.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={n === count}
            onClick={() => setCount(n)}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-sm aria-pressed:border-gray-900 aria-pressed:bg-gray-900 aria-pressed:text-white"
          >
            {n.toLocaleString()} images
          </button>
        ))}
      </div>

      {images.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <ImageCarousel
          items={images}
          className="h-[clamp(240px,60svh,720px)]"
        />
      )}
    </main>
  );
}

export default App;
