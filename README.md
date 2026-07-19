# Dubai Property Intelligence

An executive dashboard for Dubai Land Department transaction exports. It includes KPI cards, sales and pricing trends, property and location analysis, price distribution, a price-per-square-foot heat map, and a text-based AI data assistant.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Data

The bundled data file is in `public/dubai-land-transactions-2026.csv`. Replace it in the dashboard, or update that file for a new default dataset.

## AI data assistant

Copy `.env.example` to `.env.local` and set your OpenAI API key:

```bash
OPENAI_API_KEY=your_key_here
```

Never commit `.env.local` or an API key. The app sends only an aggregate snapshot of the active filter results to the server-side AI endpoint.

## Publish with GitHub

1. Create a new empty repository in GitHub, for example `dubai-property-intelligence`.
2. From this folder, add your remote and push:

```bash
git remote add origin https://github.com/YOUR-ACCOUNT/dubai-property-intelligence.git
git branch -M main
git push -u origin main
```

The included GitHub Actions workflow validates every push. For a public deployment, import the GitHub repository into Cloudflare Pages or Vercel, then add `OPENAI_API_KEY` to that platform's environment-variable settings if you want the AI assistant enabled.

## Deploy to Cloudflare Workers

This project includes a `wrangler.jsonc` configuration for Cloudflare Workers. In the Cloudflare dashboard, use **Workers & Pages → Create application → Workers → Import a repository**, select this repository and the `main` branch, and use `npm run deploy` as the deployment command if Cloudflare asks for one. Add `OPENAI_API_KEY` under **Settings → Variables and Secrets** as a **Secret** after the first deployment.
