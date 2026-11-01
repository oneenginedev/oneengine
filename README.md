# OneEngine Website

A beautifully minimal, high-performance static website for **OneEngine**, designed with the clean light-paper aesthetic of Sonara.

## Deployment to GitHub Pages

This website is **100% static** (pure HTML5, CSS3, vanilla JavaScript) with **zero dependencies or build steps**:

1. Push this repository to GitHub.
2. In your repository settings, go to **Settings > Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose `main` (or `master`) branch and folder `/ (root)`.
5. Click **Save**. Your site will be live instantly!

## Structure

- `index.html`: Main landing page with hero, live simulation canvas, architecture showcase, telemetry tuner, bento grid, and FAQ.
- `download.html`: Minimal download portal with automated steps.
- `style.css`: Clean, responsive stylesheet adhering to the light-paper aesthetic.
- `site.js`: Vanilla JS for canvas simulation, telemetry tuner, tab switching, and typing animation.
- `favicon.svg`: Vector icon.
- `.nojekyll`: Ensures GitHub Pages serves all assets directly without Jekyll processing.
