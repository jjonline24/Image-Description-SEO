# Image → Description & SEO (Netlify Template)
Static site + Netlify Functions for AI product copy (TH/EN) and optional Google Sheets export.

## One‑click Deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=YOUR_GITHUB_REPO_URL)

> Replace `YOUR_GITHUB_REPO_URL` with your public repo URL after you push this template to GitHub.

## GitHub Actions → Netlify deploy
This repo includes `.github/workflows/netlify-deploy.yml`.

**Set GitHub Secrets:**
- `NETLIFY_AUTH_TOKEN` — https://app.netlify.com/user/applications#personal-access-tokens
- `NETLIFY_SITE_ID` — Site settings → Site information

Then push to `main` to deploy.

## Environment variables
Import `.env.netlify` to Netlify → Site settings → Environment variables → Import.

## Endpoints
- `/.netlify/functions/generate` — OpenAI Responses API (vision), returns structured JSON.
- `/.netlify/functions/export-sheets` — Append a row to Google Sheets.

## Local tests
```bash
npm i
npm run test
```

## Notes
- OpenAI client is declared once in `netlify/functions/lib/openai.js` and imported elsewhere (prevents duplicate declaration).
- Static site; serverless functions run on Netlify.
- `GOOGLE_PRIVATE_KEY` must be a single line with `\n`.
