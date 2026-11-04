# OneEngine Website

The static website for **OneEngine**: a landing page, a download page, a changelog, a 404 page and a small web store. It is plain HTML, CSS and vanilla JavaScript with no build step. The visual system is described in [`DESIGN.md`](DESIGN.md).

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

- `index.html`: landing page: hero, architecture (systems tabs), profiling (telemetry presets), game showcase, services, get started (download cards and philosophy) and FAQ.
- `download.html`: shows the latest GitHub release with its file, size and date, or "No public build yet".
- `changelog.html`: release notes for every GitHub release.
- `404.html`: not-found page. Its `<base href>` must match the site URL above.
- `style.css`: all site styles. The `:root` tokens at the top are the single source of truth.
- `site.js`: fire canvas, hero pause control, stat count-up, systems tabs with pause control, telemetry presets, video playback, mobile nav, and GitHub release data.
- `store/`: the pre-built store app (build output only; `assets/` is what `index.html` loads, and the copies in the `store/` root are unused).
- `sitemap.xml`, `robots.txt`: search engine files.
- `og-image.jpg`: 1200 × 630 social preview image.
- `favicon.svg`, `.nojekyll`, `LICENSE`.

## Media

| File | Purpose |
| :--- | :--- |
| `gameplay-preview-1280.webm`, `gameplay-preview-1280.mp4` | Videos used by the site |
| `gameplay-frame.webp` | Video poster |
| `gameplay-preview.mp4`, `gameplay-frame.jpg` | Originals, not referenced by any page (sources for the videos and `og-image.jpg`) |

### Files no longer used by any page

These are kept in the repo but nothing references them:

- `railbound.webp`, `railbound.jpg`
- `gameplay-preview.mp4`, `gameplay-frame.jpg` (originals, see above)
- `store/favicon.png`, and the duplicate bundle files in the `store/` root (`core-*.js`, `event-*.js`, `index-*.js`, `index-*.css`, `window-*.js`). The store loads its copies from `store/assets/`.

To regenerate the videos from the original:

```
ffmpeg -i gameplay-preview.mp4 -vf scale=1280:-2 -c:v libx264 -crf 30 -preset slow -profile:v main -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 64k gameplay-preview-1280.mp4
ffmpeg -i gameplay-preview.mp4 -vf scale=1280:-2 -c:v libvpx-vp9 -crf 46 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p -c:a libopus -b:a 40k gameplay-preview-1280.webm
```

## Release data

Versions, file sizes and dates are not written by hand. `site.js` reads them from the GitHub Releases API for `oneenginedev/oneengine` and caches them for 10 minutes per tab. To publish a build, create a release on GitHub and attach the Windows `.exe`, `.zip` or `.msi`: the download page links straight to that file and the changelog lists the release notes. With no releases, both pages say so.

## Figures and sample data

- Engine figures (128Hz, 100k entities, <7ms, 12MB, 14ms reload, 60KB replays and so on) are labelled as **v1.0 design targets**. Replace the label with a source once they are measured.
- The telemetry chart is labelled **illustrative**.
- The Railbound rating and price, and the store's prices, ratings and reviews, are labelled **sample data**. Replace them with real figures once the game is on sale.

## License

Apache License 2.0. See [`LICENSE`](LICENSE).
