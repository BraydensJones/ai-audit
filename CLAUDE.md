# CLAUDE.md — Audit Intake Form Project

## What this project is

A single-page custom intake form for Brayden's Automations. Clients land here
AFTER paying $497 for an "Inbound Audit." They've already paid. This form
collects what's needed to actually do their audit. It is the first thing they
see post-purchase, so it represents the quality of the product.

Deploy target: `apply.braydensautomations.com` (standalone static site,
deployed via Coolify on the same server as n8n). NOT part of the Framer site.

## The business (context, do not put this on the page)

Brayden's Automations is a solo AI automation agency serving service
businesses (home services, clinics, HVAC, plumbing). The Inbound Audit is a
productized $497 written diagnostic: it tells a business owner how much money
they lose to missed calls and slow follow-up, with a prioritized roadmap.
Delivery is 5 business days after the client submits this form.

## Brand voice — HARD RULES (these are non-negotiable)

All microcopy, labels, helper text, confirmation messages, and error messages
must follow these:

- NO em dashes ever. Use periods, commas, or parentheses.
- NO corporate jargon. Banned: synergy, leverage, best-in-class, cutting-edge,
  revolutionary, game-changer, unlock, empower, transform, elevate, seamless,
  holistic, next-level.
- NO filler words. Banned: genuinely, honestly, straightforward, basically,
  literally, actually, really.
- NO hype. No "AI is changing everything," no exclamation-heavy enthusiasm.
- Short sentences. Direct. Confident, not arrogant.
- Say what you mean. "Upload your call logs" not "Please kindly provide your
  call data documentation if available."
- No "I hope this finds you well" energy anywhere.

Voice reference, GOOD: "Payment received. I need two things to start your
audit. This takes about 5 minutes."
Voice reference, BAD: "Thank you so much for your purchase! We're so excited
to embark on this journey with you. Please fill out the form below!"

## Visual style

- Clean, modern, professional. Closer to a well-designed SaaS onboarding than
  a marketing landing page.
- Neutral base (off-white / cream background, dark text), ONE accent color
  for buttons and focus states. Accent: a burnt orange (#C8642D range is a
  good starting point, refine for contrast/accessibility).
- Generous whitespace. Mobile-first, must look right on a phone (clients will
  open the post-payment email on mobile).
- No stock photos, no illustrations, no clip art. Type and layout carry it.
- System font stack or one clean web font. No more than one font family.
- The form should feel fast and frictionless, not like a survey.

## Technical constraints

- Static site. HTML/CSS/vanilla JS, OR a minimal build (Vite + vanilla/React
  is acceptable if it outputs a static bundle). No server runtime required.
  It will be served as static files by Coolify.
- On submit: POST the collected fields as a single JSON object to an n8n
  webhook. Use the placeholder constant `N8N_INTAKE_WEBHOOK_URL` until the
  real URL is provided. Make this a single clearly-marked constant at the top
  of the JS so it is a one-line change later.
- Client-side validation before submit. Show clear inline errors (voice rules
  apply to error text).
- On success: show a clean confirmation state on the same page (no redirect).
  The confirmation tells them what happens next (see kickstart.md for exact
  copy intent).
- Handle the failure case: if the POST fails, show an error state that tells
  them to email brayden@braydensautomations.com, and do NOT lose their input.
- File upload: the form needs to accept a call-log file (CSV/PDF/Excel/screenshot).
  Decide the simplest reliable approach for a static site posting to a webhook
  (base64 in the JSON payload is acceptable for reasonable file sizes; if a
  file is too large, instruct them to email it instead, with their email as
  the match key). Document the choice in kickstart.md.
- No analytics, no trackers, no third-party embeds, no cookie banners needed.
- Accessibility: proper labels, keyboard navigable, sufficient color contrast.

## What NOT to do

- Do not build a backend or database. n8n + Airtable already handle storage.
- Do not add a payment step. They already paid. This is post-payment only.
- Do not use Tally, Typeform, Google Forms, or any third-party form embed.
  The entire point is that this is custom and watermark-free.
- Do not invent fields not listed in kickstart.md.
- Do not deploy anything. Build it, output it, explain how to deploy. Brayden
  deploys via Coolify himself.
- Do not write marketing copy or sell the audit. They already bought it.

## Definition of done

See kickstart.md "Acceptance criteria." Do not consider the task complete
until every box there is satisfied.
