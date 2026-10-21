import { useEffect, useState } from "react";
import { api } from "../api.js";
import FavoriteButton from "./FavoriteButton.jsx";

// Full class names so Tailwind can detect them.
const layoutClasses = {
  normal: "",
  tall: "row-span-2",
  wide: "sm:col-span-2",
};

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [favorites, setFavorites] = useState([]);

  // Load the gallery from the API when the component first appears.
  useEffect(() => {
    api("/photos")
      .then(setPhotos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(photos.map((photo) => photo.category))];
  const visiblePhotos =
    filter === "All" ? photos : photos.filter((photo) => photo.category === filter);

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  return (
    <section id="work" aria-labelledby="work-title" className="bg-white">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="work-title" className="text-3xl font-bold">
              Selected work
            </h2>
            <p className="mt-1 text-muted">
              {favorites.length} {favorites.length === 1 ? "favorite" : "favorites"} saved
            </p>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                aria-pressed={filter === category}
                className={`cursor-pointer rounded border px-4 py-2 ${
                  filter === category
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-white text-ink hover:border-accent"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-muted">Loading photos...</p>}
        {error && <p role="alert" className="text-red-700">Could not load photos: {error}</p>}

        <ul className="grid auto-rows-[16rem] grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePhotos.map((photo) => (
            <li key={photo.id} className={layoutClasses[photo.layout]}>
              <figure className="group relative h-full overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent px-3 pt-6 pb-2 text-sm text-white">
                  {photo.title}
                </figcaption>
                <FavoriteButton
                  label={photo.title}
                  active={favorites.includes(photo.id)}
                  onToggle={() => toggleFavorite(photo.id)}
                />
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}