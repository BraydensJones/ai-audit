# DEPLOY.md (apply.braydensautomations.com)

Static site. Three files plus this doc:

- `index.html`
- `styles.css`
- `app.js`

No build step. Coolify serves the folder as-is.

## 1. Set the webhook URL

In `app.js`, line 2, replace the placeholder:

```js
const N8N_INTAKE_WEBHOOK_URL = "https://n8n.braydensautomations.com/webhook/your-id";
```

Commit and push.

## 2. Create a Coolify resource

Same Coolify instance that runs n8n.

1. New Resource → **Static Site** (or "Public Repository" if pulling from git).
2. Point it at this repo / branch, or upload the three files directly.
3. Build command: none. Output / publish directory: the project root (where `index.html` sits).
4. Port: whatever Coolify assigns for static (default works).
5. Deploy.

## 3. DNS

Same pattern as `n8n.braydensautomations.com`.

1. In your DNS provider, add an **A record**:
   - Name: `apply`
   - Value: the Coolify server's public IP
   - TTL: default
2. In Coolify, on the resource, add domain `apply.braydensautomations.com`.
3. Coolify provisions a Let's Encrypt cert automatically. Wait for green.

## 4. Smoke test

Open `https://apply.braydensautomations.com`:

- Page loads, no console errors.
- Submit empty form → inline errors appear.
- Fill it in with a small file, submit → n8n webhook receives the JSON payload documented in `kickstart.md`.
- Submit with a >5MB file → blocked client-side with the fallback message.

## 5. Updating

Edit files, push (or re-upload), redeploy in Coolify. Static, so deploy is seconds.

## 6. Sales page (`audit.html`)

This repo also ships a sales page at `audit.html`. It uses the same
`styles.css` and the same brand fonts. The only outbound action is a CTA
button linking to the Stripe checkout for the $497 Inbound Audit.

Recommended route: a separate subdomain on the same Coolify server, e.g.
`audit.braydensautomations.com`.

1. In Coolify, create a second Static Site resource pointing at this repo
   (or upload the same files). Set the index document to `audit.html`. In
   most Coolify static-site configs you can either:
   - Rename `audit.html` to `index.html` in a separate branch or folder
     served by that resource, or
   - Configure the nginx default file to `audit.html`.
2. Add an A record for `audit` pointing at the same Coolify IP, then add
   the domain to the resource. Let's Encrypt issues automatically.

If you do not want a second subdomain, the page is also reachable on the
existing apply site at `https://apply.braydensautomations.com/audit.html`
with no extra config. The Stripe button on the sales page sends purchasers
to checkout, and the existing post-payment redirect should point at
`apply.braydensautomations.com` (the intake form).
