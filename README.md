# mohammad Eltegani | Photography Portfolio

A single-page, responsive photography portfolio built with plain HTML5 and CSS3. No frameworks, no JavaScript.

**Live site:** _add your GitHub Pages link here_

## Features

- Hero section with an introduction and a featured photo
- Image gallery grid as the centerpiece, with tall and wide tiles
- Short about section
- "Book a shoot" contact form instead of a shop button
- Sticky header with working in-page navigation links
- Responsive layout with no horizontal scrolling on phone, tablet or desktop

## Project structure

```
.
├── index.html   # page structure and content
├── style.css    # all styles
└── README.md
```

## project requirements

| Requirement | Where |
| --- | --- |
| Single page, plain HTML5/CSS3 | `index.html` and `style.css` only |
| Semantic landmarks, one `h1` | `header`, `nav`, `main`, `section`, `footer`; one `h1` in the hero |
| Working nav links | `#work`, `#about`, `#contact` anchors |
| `box-sizing: border-box` globally | `*, *::before, *::after` rule in `style.css` |
| Own CSS variables for colors | `:root` block (`--paper`, `--ink`, `--accent`, `--deep` and others) |
| Real use of Grid | `.gallery` uses `auto-fill` / `minmax` with spanning tiles |
| Real use of Flexbox | header, nav, hero, contact form, footer |
| `object-fit: cover` | gallery images and hero image |
| No horizontal scroll | fluid images, one-column gallery on small screens, no fixed widths |

## Run it locally

1. Clone the repo:
   ```
   git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
   ```
2. Open `index.html` in a browser.

## Deploy with GitHub Pages

1. Push the project to GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Your site appears at `https://YOUR-USERNAME.github.io/YOUR-REPO/` after a minute or two.

## Notes

- Photos are placeholders from [picsum.photos](https://picsum.photos). Replace them with your own images and update the `alt` text.
- The contact form has no backend (`action="#"`), so submitting it does not send anything. A service such as Formspree could be added later.
