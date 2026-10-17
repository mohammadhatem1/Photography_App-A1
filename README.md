# Mohammad Eltegani | Photography Portfolio (React + Tailwind)

Assignment 1 rebuilt with Vite, React and Tailwind CSS. Same content and look, now componentized.

**Live site:** http://localhost:5173/

## Stack

- Vite + React (JavaScript, no TypeScript)
- Tailwind CSS v4 via `@tailwindcss/vite`
- No other libraries; data is hardcoded until Week 3

## Structure

```
src/
├── main.jsx
├── App.jsx
├── index.css                  # Tailwind import + @theme color variables
├── data/photos.js             # gallery items (array of objects)
└── components/
    ├── Header.jsx
    ├── Hero.jsx
    ├── Gallery.jsx            # main grid + category filter (useState)
    ├── FavoriteButton.jsx     # small controlled component, one per photo
    ├── About.jsx
    ├── Contact.jsx
    └── Footer.jsx
```

## Run it

```
npm install
npm run dev
```

Build for production with `npm run build`.

## Notes

- The filter in `Gallery.jsx` uses `useState` to show one category at a time.
- `FavoriteButton` is controlled: the parent holds the favorites list and passes `active` and `onToggle`.
- Classes are written mobile-first (unprefixed, then `sm:`, `md:`, `lg:`).
- Photos are placeholders from picsum.photos. Replace them in `src/data/photos.js`.
- The contact form has no backend yet; submitting just shows a thank-you message.
