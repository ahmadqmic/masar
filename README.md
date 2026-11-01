# Masar — Qatar University Landing Page

Production-oriented static website package based on the latest V12 design (November 2026).

## Deploy to GitHub Pages

1. Create a new GitHub repository (for example `masar-website`).
2. Upload **the contents of this directory**, not the directory itself: `index.html`, `styles.css`, `app.js`, `favicon.svg`, and `assets/`.
3. Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.
4. Open the GitHub Pages URL once deployment completes.

For a custom domain, configure the domain in GitHub Pages and the corresponding DNS settings with your IT team.

## Structure

```text
index.html                 Main page; original feature content and inline animated route SVG
styles.css                 Consolidated styles in original load order
app.js                     Consolidated JavaScript for the complete page
favicon.svg                Favicon
assets/                    Only assets referenced by the website
.gitignore                 Ignores backups, test outputs and local files
.nojekyll                  GitHub Pages: publish files as-is
```

## Local preview

Run a local static server from this directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Direct `file://` opening is not recommended for all browser behaviors.

## Notes

- Static website: no Node dependencies, build scripts, or backend required.
- The animated bus network is **inline in `index.html`**; it is not an external SVG asset.
- App images and the navigation video are examples / recorded previews, **not live traffic, bus-tracking, or parking feeds**.
- Font Awesome icons load from a third-party CDN and require Internet access.
- Qatar University campus photo rights and example parking values should be reviewed before public deployment.
- This package contains no backup versions, old screenshots, QA files, test scripts, or build artifacts.
