# cordevra-site

- `index.html`: cordevra.com landing page
- `app/index.html`: the demo (sample data only, runs in the browser) served at demo.cordevra.com
- `real/`: the real Cordevra app (built from Cordevra/cordevra `frontend`, `VITE_DEMO=0`) served at app.cordevra.com; `/api` and `/sanctum` are proxied to api.cordevra.com
- `vercel.json`: routes demo.cordevra.com and app.cordevra.com

Every commit to `main` deploys automatically on Vercel.
