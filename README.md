<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/aeb56181-80f5-43ee-95c5-beb996d4e49f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Zeus Pass 3

This iteration adds real GitHub-to-Netlify continuous-deployment provisioning: a Netlify deploy key is created server-side, installed on the provisioned GitHub repository, and the Netlify site is linked to that repository. The orchestrator can query real deployment state after commits. Platform SQL no longer grants anonymous access to core tables; browser access is restricted to authenticated users while the server uses the service-role key for privileged operations.
