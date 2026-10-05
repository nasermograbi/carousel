import { useEffect, useState } from "react";
import { ImageCarousel } from "./components/ImageCarousel/ImageCarousel";
import { fetchImages, getPicsumSrc } from "./services/picsum";
import type { ImageCarouselItem } from "./types/carousel";

const IMAGE_COUNTS = [12, 1000];
const CAROUSEL_HEIGHT = "h-[clamp(240px,min(60svh,100vw),720px)]";

type Result = {
  request: string;
  images: ImageCarouselItem[] | null;
};

function App() {
  const [count, setCount] = useState(IMAGE_COUNTS[0]);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  const request = `${count}:${attempt}`;
  const current = result?.request === request ? result : null;

  useEffect(() => {
    let ignore = false;
    fetchImages(count).then(
      (images) => {
        if (!ignore) setResult({ request, images });
      },
      () => {
        if (!ignore) setResult({ request, images: null });
      },
    );
    return () => {
      ignore = true;
    };
  }, [count, request]);

  return (
    <main className="py-10">
      <header className="mx-auto mb-8 flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Infinite carousel
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Scroll or swipe sideways. It loops in both directions.
          </p>
        </div>
        <div
          role="group"
          aria-label="Number of images"
          className="inline-flex rounded-lg border border-neutral-200 bg-white p-1"
        >
          {IMAGE_COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={n === count}
              onClick={() => setCount(n)}
              className="rounded-md px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:text-neutral-900 aria-pressed:bg-neutral-900 aria-pressed:text-white"
            >
              {n.toLocaleString()} images
            </button>
          ))}
        </div>
      </header>

      {current === null ? (
        <div
          role="status"
          className={`${CAROUSEL_HEIGHT} flex items-center justify-center text-sm text-neutral-500`}
        >
          Loading images…
        </div>
      ) : current.images === null ? (
        <div
          role="alert"
          className={`${CAROUSEL_HEIGHT} flex items-center justify-center gap-3 text-sm text-neutral-700`}
        >
          Couldn't load images.
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 transition-colors hover:bg-neutral-100"
          >
            Try again
          </button>
        </div>
      ) : (
        <ImageCarousel
          items={current.images}
          getImageSrc={getPicsumSrc}
          className={CAROUSEL_HEIGHT}
        />
      )}
    </main>
  );
}

export default App;
