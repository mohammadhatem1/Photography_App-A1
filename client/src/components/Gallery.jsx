import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import FavoriteButton from "./FavoriteButton.jsx";

// Full class names so Tailwind can detect them.
const layoutClasses = {
  normal: "",
  tall: "row-span-2",
  wide: "sm:col-span-2",
};

const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

export default function Gallery() {
  const { user, openAuth } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [favorites, setFavorites] = useState([]); // photo ids, saved in the database
  const [orderingId, setOrderingId] = useState(null);
  const [orderError, setOrderError] = useState("");

  const userId = user?.id;

  // Load the gallery from the API when the component first appears.
  useEffect(() => {
    api("/photos")
      .then(setPhotos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Load this user's saved favorites whenever someone signs in or out.
  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFavorites([]);
      return;
    }
    api("/favorites")
      .then(setFavorites)
      .catch(() => setFavorites([]));
  }, [userId]);

  // If the browser restores this page from the back button after Stripe, reset the button.
  useEffect(() => {
    const reset = (event) => {
      if (event.persisted) setOrderingId(null);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const categories = ["All", ...new Set(photos.map((photo) => photo.category))];
  const visiblePhotos =
    filter === "All" ? photos : photos.filter((photo) => photo.category === filter);

  async function toggleFavorite(id) {
    if (!user) {
      openAuth("Sign in to save favorites.");
      return;
    }
    const isFavorite = favorites.includes(id);

    // Update the screen right away, then save; undo if the save fails.
    setFavorites((current) =>
      isFavorite ? current.filter((item) => item !== id) : [...current, id]
    );
    try {
      await api(`/favorites/${id}`, { method: isFavorite ? "DELETE" : "PUT" });
    } catch {
      setFavorites((current) =>
        isFavorite ? [...current, id] : current.filter((item) => item !== id)
      );
    }
  }

  async function startCheckout(photo) {
    if (!user) {
      openAuth("Sign in to order a print.");
      return;
    }
    setOrderError("");
    setOrderingId(photo.id);
    try {
      // Only the photo id is sent. The server looks up the real price.
      const data = await api("/checkout", { method: "POST", body: { photoId: photo.id } });
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = data.url; // Stripe's hosted checkout page
    } catch (err) {
      setOrderError(err.message);
      setOrderingId(null);
    }
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
              {user
                ? `${favorites.length} ${favorites.length === 1 ? "favorite" : "favorites"} saved`
                : "Sign in to save favorites and order prints"}
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
        {orderError && <p role="alert" className="mb-4 text-red-700">{orderError}</p>}

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
                <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-linear-to-t from-black/65 to-transparent px-3 pt-6 pb-2 text-sm text-white">
                  <span>{photo.title}</span>
                  <button
                    type="button"
                    onClick={() => startCheckout(photo)}
                    disabled={orderingId === photo.id}
                    className="cursor-pointer rounded bg-white px-3 py-1 font-bold whitespace-nowrap text-ink hover:bg-tint disabled:opacity-60"
                  >
                    {orderingId === photo.id
                      ? "Redirecting..."
                      : `Order print · ${formatPrice(photo.price_cents)}`}
                  </button>
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