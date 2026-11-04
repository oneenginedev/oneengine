# OneEngine Website

The static website for **OneEngine**: a landing page, a download page, a 404 page and a small web store. It is plain HTML, CSS and vanilla JavaScript with no build step. The visual system is described in [`DESIGN.md`](DESIGN.md).

## Site URL

The canonical URL, `og:` and Twitter tags, `sitemap.xml`, `robots.txt` and the base URL in `404.html` all use:

```
https://oneenginedev.github.io/oneengine/
```

If the site is hosted somewhere else (a custom domain, a different repo name), search for that string and replace it everywhere.

## Deployment to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then save.

`.nojekyll` makes Pages serve every file as-is. GitHub Pages serves `404.html` automatically for missing paths.

## Local preview

```
python3 -m http.server 8000
```

Then open http://localhost:8000. Do not open `index.html` straight from disk: the videos and the store need a web server.

## Structure

- `index.html`: landing page with the hero and laptop mockup, systems tabs, telemetry presets, game showcase, services, vision, download cards and FAQ.
- `download.html`: download page that links to the GitHub releases.
- `404.html`: not-found page. Its `<base href>` must match the site URL above.
- `style.css`: all site styles.
- `site.js`: fire canvas, stat count-up, systems tabs, telemetry presets, video playback, mobile nav.
- `store/`: the pre-built store app (build output only; `assets/` is what `index.html` loads, and the copies in the `store/` root are unused).
- `sitemap.xml`, `robots.txt`: search engine files.
- `og-image.jpg`: 1200 × 630 social preview image.
- `favicon.svg`, `.nojekyll`, `LICENSE`.

## Media

| File | Purpose |
| :--- | :--- |
| `gameplay-preview-1280.webm`, `gameplay-preview-1280.mp4` | Videos used by the site |
| `gameplay-frame.webp`, `railbound.webp` | Posters and card images |
| `gameplay-preview.mp4`, `gameplay-frame.jpg`, `railbound.jpg` | Originals, not referenced by any page (`gameplay-frame.jpg` is also the source for `og-image.jpg`) |

To regenerate the videos from the original:

```
ffmpeg -i gameplay-preview.mp4 -vf scale=1280:-2 -c:v libx264 -crf 30 -preset slow -profile:v main -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 64k gameplay-preview-1280.mp4
ffmpeg -i gameplay-preview.mp4 -vf scale=1280:-2 -c:v libvpx-vp9 -crf 46 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p -c:a libopus -b:a 40k gameplay-preview-1280.webm
```

## Sample data

The Railbound rating and price on the landing page are placeholders for demonstration, and the page labels them as such. Replace them with real figures once the game is on sale.

## License

MIT. See [`LICENSE`](LICENSE).
