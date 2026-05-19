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

## 6. Two subdomains, two Coolify resources, one repo

Both subdomains pull from this same repo. The split is done by pointing
each Coolify resource at a different publish directory. Every static
deploy serves the publish directory's `index.html`, so each subdomain
needs its own `index.html`.

Repo layout:

```
/                  <- apply.braydensautomations.com (intake form)
  index.html       <- the form
  styles.css
  app.js
/sales/            <- audit.braydensautomations.com (sales page)
  index.html       <- the sales page
  styles.css       <- duplicate, kept in sync (see note below)
```

### Coolify field values

**Resource A: `apply.braydensautomations.com` (intake form)**
- Base Directory: `/`
- Publish Directory: `/` (leave at the repo root)
- Domains: `apply.braydensautomations.com`

**Resource B: `audit.braydensautomations.com` (sales page)**
- Base Directory: `/`
- Publish Directory: `/sales`
- Domains: `audit.braydensautomations.com`

After saving Resource B's Publish Directory, redeploy. Coolify will now
serve `/sales/index.html` as the document root for `audit.*`, so
`https://audit.braydensautomations.com/` loads the sales page.

### DNS

Both subdomains get an A record pointing at the Coolify server's public
IP. Let's Encrypt provisions certs automatically once each domain is
attached to its resource.

### Keeping styles.css in sync

`styles.css` exists in two places: the repo root (used by the form) and
`/sales/styles.css` (used by the sales page). When you change the theme,
edit `styles.css` at the root, then copy it into `/sales/`:

```
cp styles.css sales/styles.css
```

Commit both. Static deploys do not follow symlinks reliably across
hosts, which is why this is a file copy rather than a link.
