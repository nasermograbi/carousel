import { useEffect, useState } from "react";
import { ImageCarousel } from "./components/ImageCarousel";
import { fetchImages } from "./services/picsum";
import type { ImageCarouselItem } from "./types/carousel";

function App() {
  const [images, setImages] = useState<ImageCarouselItem[]>([]);

  useEffect(() => {
    fetchImages().then(setImages);
  }, []);

  if (images.length === 0) return <p>Loading...</p>;

  return (
    <ImageCarousel
      items={images}
      className="h-[clamp(240px,60svh,720px)]"
    />
  );
}

export default App;
