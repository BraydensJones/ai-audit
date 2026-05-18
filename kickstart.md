# kickstart.md — Implementation Plan: Audit Intake Form

## Goal

Build a single-page custom intake form, deployed as a static site to
`apply.braydensautomations.com`, that collects the information needed to
perform a paid Inbound Audit and POSTs it as JSON to an n8n webhook.

Read CLAUDE.md first. Every brand voice and technical rule there applies.

## The exact fields (do not add or remove)

The audit requires three things from the client. The form collects them plus
identity fields so the submission can be matched to their paid record.

### Section: Your details
1. **Full name** (text, required)
2. **Email** (email, required) — THIS IS THE MATCH KEY. The n8n workflow uses
   this to find the client's existing audit record in Airtable (created when
   they paid via Stripe). Label it clearly: use the same email you paid with.
3. **Business name** (text, required)
4. **Phone** (tel, required)

### Section: Your numbers
5. **Average job or customer value** (text/number, required). Helper text
   intent: this is what one new customer is worth to you on average. If your
   business is recurring, estimate the lifetime value. A rough number is fine,
   I will refine it with you on the call.
6. **Roughly how many inbound calls do you get per week?** (number, required).
   Helper text intent: an estimate is fine.

### Section: Your call data
7. **Call log upload** (file, required). Accept CSV, Excel, PDF, or image.
   Helper text intent: an export of your last 30 days of calls. Most phone
   systems and VOIP providers can export this. If you cannot export it, see
   the note below.
8. **Cannot export your call log? checkbox** (optional). If checked, reveal a
   short textarea: "Describe your phone setup (who answers, what hours, what
   happens to after-hours calls)." This is the fallback when no export exists.

### Section: Anything else
9. **What made you book this audit?** (textarea, optional). Helper text
   intent: one or two sentences on what prompted this. Optional but useful.

## File upload handling

Decide and document here which approach you implemented:
- Preferred: base64-encode the file into the JSON payload if under a sane size
  limit (e.g. 5MB). Above that, block the upload client-side and show a
  message instructing them to email the file to
  brayden@braydensautomations.com with their email as the subject, while
  still letting them submit the rest of the form.
- Document the exact size limit chosen and the exact fallback copy used
  (must follow CLAUDE.md voice rules).

### Implemented

- **Approach:** base64-encode the file and send it inside the JSON payload as
  `call_log_base64`, with the original filename in `call_log_filename`.
- **Size limit:** 5 MB (5 * 1024 * 1024 bytes). Enforced client-side in
  `app.js` via the `MAX_FILE_BYTES` constant.
- **Oversize fallback copy (exact string):** "File is over 5MB. Email it to
  brayden@braydensautomations.com with your email address as the subject. You
  can submit the rest of the form now." Shown inline beneath the file input.
  The rest of the form remains submittable; the payload sends
  `call_log_filename: null` and `call_log_base64: null`.
- **"Cannot export" fallback:** ticking the checkbox hides the file
  requirement and reveals the phone-setup textarea, which becomes required
  and is sent as `phone_setup_description`.

## Submission payload

POST to `N8N_INTAKE_WEBHOOK_URL` (placeholder constant, single line, top of
JS). Content-Type application/json. Body shape:

```
{
  "full_name": "...",
  "email": "...",
  "business_name": "...",
  "phone": "...",
  "avg_job_value": "...",
  "calls_per_week": "...",
  "call_log_filename": "...",
  "call_log_base64": "..." | null,
  "phone_setup_description": "..." | null,
  "booking_reason": "..." | null,
  "submitted_at": "ISO timestamp"
}
```

## Confirmation state (on success)

Replace the form with a clean confirmation. Copy intent (write it in brand
voice, these are not literal final strings, but stay this direct):
- Confirm it was received.
- State what happens next: the audit takes 5 business days from this
  submission. They get a written report plus a 30-minute call to go through
  it.
- Tell them they can reply to the original email if anything changes.
- No exclamation marks. No "we're excited." Calm and competent.

## Error state (on failed POST)

- Tell them the submission did not go through.
- Tell them to email brayden@braydensautomations.com directly and their audit
  will still be handled.
- Do not clear the form. Their input stays so they can retry.

## Acceptance criteria (definition of done)

- [ ] Single page, loads fast, no console errors.
- [ ] Looks correct and is fully usable on a phone (test at 375px width).
- [ ] All required fields validated client-side with inline errors in brand
      voice.
- [ ] Email field clearly marked as "use the email you paid with."
- [ ] File upload works; oversize fallback implemented and documented above.
- [ ] Successful submit POSTs correct JSON shape to the webhook constant.
- [ ] Success confirmation state implemented, in brand voice, no redirect.
- [ ] Failure state implemented, input preserved, correct fallback email.
- [ ] `N8N_INTAKE_WEBHOOK_URL` is a single clearly-labeled constant.
- [ ] Zero em dashes anywhere in the rendered page or code comments shown to
      user. Zero banned jargon/filler words in any user-facing text.
- [ ] No third-party embeds, trackers, or form-builder dependencies.
- [ ] Build outputs static files and a short DEPLOY.md explaining exactly how
      to serve it via Coolify (as a static site / new resource), including
      how to point apply.braydensautomations.com at it (Brayden has done this
      pattern before with n8n.braydensautomations.com, keep instructions
      aligned to Coolify + a DNS A record).

## Out of scope (do not build)

- The n8n webhook workflow itself (Brayden builds that separately).
- The Airtable matching logic (lives in n8n).
- The sales page (built separately in Framer).
- Any payment handling.
