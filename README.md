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

- `index.html`: landing page: hero, systems marquee, architecture bento (dark), Get OneEngine banner, Railbound showcase, services, FAQ, closing call to action.
- `download.html`: shows the latest GitHub release with its file, size and date, or "No public build yet".
- `changelog.html`: release notes for every GitHub release.
- `404.html`: not-found page. Its `<base href>` must match the site URL above.
- `style.css`: all site styles. The `:root` tokens at the top are the single source of truth.
- `site.js`: fire canvas, the hero pause control (it pauses every loop on the page), video playback, Lenis smooth scrolling, reveal-on-scroll, the nav's dark mode over the dark band, the current-section highlight, the mobile menu, GitHub release data and the live commits card.

The only third-party script is [Lenis](https://github.com/darkroomengineering/lenis) 1.1.20 for smooth scrolling, loaded from jsDelivr with a pinned version and an `integrity` hash. To upgrade it, change the version in the `<script>` tag on `index.html`, `download.html` and `changelog.html` and replace the `integrity` value with the new file's SHA-384 hash.
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

## Fonts

Outfit (headings), Manrope (body), Caveat (the one script word in the hero), Unbounded (the logo wordmark) and JetBrains Mono (terminal and code), all from Google Fonts with `display=swap`.

## Release data

Versions, file sizes, dates and the commit count are not written by hand. `site.js` reads them from the GitHub Releases API for `oneenginedev/oneengine` and caches them for 10 minutes per tab. To publish a build, create a release on GitHub and attach the Windows `.exe`, `.zip` or `.msi`: the download page links straight to that file and the changelog lists the release notes. With no releases, both pages say so.

## No mock data

The marketing pages contain no unmeasured engine figures, demo benchmarks, ratings or prices. Only add a number once it is measured and you can link to its source.

The prebuilt store in `store/` still ships sample prices, ratings and reviews inside its bundle; `store/index.html` shows a "Sample data" note for them.

## License

Apache License 2.0. See [`LICENSE`](LICENSE).
