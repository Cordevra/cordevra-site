# cordevra-site

- `index.html`: cordevra.com landing page
- `app/index.html`: the demo (sample data only, runs in the browser) served at demo.cordevra.com
- `real/`: the real Cordevra app (built from Cordevra/cordevra `frontend`, `VITE_DEMO=0`) served at app.cordevra.com; `/api` and `/sanctum` are proxied to api.cordevra.com
- Feature pages (`client-portal-for-bookkeepers/`, `quickbooks-review/`, `e-signatures-for-bookkeeping-firms/`, `recurring-workflows/`) and the blog (`blog/`, one folder per post) are static `index.html` files served at clean URLs on cordevra.com; they share `site.css` and `site.js` (nav + waitlist form). `sitemap.xml` and `robots.txt` list cordevra.com pages only; add new posts to the blog index, related posts and the sitemap.
- `vercel.json`: routes demo.cordevra.com and app.cordevra.com; the last routes map the clean URLs above to their `index.html` for all other hosts

Every commit to `main` deploys automatically on Vercel.
