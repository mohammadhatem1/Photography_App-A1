// Controlled component: it owns no state.
// The parent passes `active` and an `onToggle` callback (same pattern as QuantityStepper).
export default function FavoriteButton({ active, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={`Favorite ${label}`}
      className="absolute top-2 right-2 flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-lg text-accent hover:bg-white"
    >
      {active ? "♥" : "♡"}
    </button>
  );
}
