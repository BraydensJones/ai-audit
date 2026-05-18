// Replace this with the real n8n webhook URL before deploy.
const N8N_INTAKE_WEBHOOK_URL = "https://n8n.braydensautomations.com/webhook/audit-intake";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const FALLBACK_EMAIL = "brayden@braydensautomations.com";
const OVERSIZE_MESSAGE =
  "File is over 5MB. Email it to " + FALLBACK_EMAIL +
  " with your email address as the subject. You can submit the rest of the form now.";

const form = document.getElementById("intake");
const submitBtn = document.getElementById("submit_btn");
const fileInput = document.getElementById("call_log");
const fileMeta = document.getElementById("file_meta");
const noExport = document.getElementById("no_export");
const uploadField = document.getElementById("upload_field");
const setupField = document.getElementById("setup_field");
const setupTextarea = document.getElementById("phone_setup_description");
const successEl = document.getElementById("success");
const failureEl = document.getElementById("failure");
const retryBtn = document.getElementById("retry_btn");

let pendingFile = null;       // { name, base64 } once a valid file is staged
let fileBlocked = false;      // true if user picked a >5MB file

function setError(name, message) {
  const input = form.elements[name];
  const errEl = form.querySelector('[data-error-for="' + name + '"]');
  if (errEl) errEl.textContent = message || "";
  if (input) {
    if (message) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  }
}

function clearErrors() {
  form.querySelectorAll(".error").forEach(function (e) { e.textContent = ""; });
  form.querySelectorAll("[aria-invalid]").forEach(function (e) {
    e.removeAttribute("aria-invalid");
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function val(name) {
  const el = form.elements[name];
  return el ? String(el.value || "").trim() : "";
}

function toggleSetup() {
  const on = noExport.checked;
  setupField.hidden = !on;
  // When no_export is on, the file is not required and any prior file error clears.
  if (on) {
    setError("call_log", "");
  } else {
    setError("phone_setup_description", "");
  }
}

noExport.addEventListener("change", toggleSetup);

fileInput.addEventListener("change", function () {
  setError("call_log", "");
  pendingFile = null;
  fileBlocked = false;
  fileMeta.hidden = true;
  fileMeta.textContent = "";

  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  if (file.size > MAX_FILE_BYTES) {
    fileBlocked = true;
    setError("call_log", OVERSIZE_MESSAGE);
    return;
  }

  const kb = file.size / 1024;
  const sizeLabel = kb >= 1024
    ? (kb / 1024).toFixed(1) + " MB"
    : Math.max(1, Math.round(kb)) + " KB";
  fileMeta.textContent = file.name + " (" + sizeLabel + ")";
  fileMeta.hidden = false;
});

function readFileAsBase64(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = function () { reject(reader.error || new Error("read failed")); };
    reader.readAsDataURL(file);
  });
}

function validate() {
  clearErrors();
  let firstBad = null;
  const mark = function (name, msg) {
    setError(name, msg);
    if (!firstBad) firstBad = form.elements[name];
  };

  if (!val("full_name")) mark("full_name", "Enter your full name.");

  const email = val("email");
  if (!email) mark("email", "Enter the email you paid with.");
  else if (!isValidEmail(email)) mark("email", "That email does not look right. Check the format.");

  if (!val("business_name")) mark("business_name", "Enter your business name.");
  if (!val("phone")) mark("phone", "Enter a phone number I can reach you at.");

  const ajv = val("avg_job_value");
  if (!ajv) mark("avg_job_value", "Enter an average value, even a rough one.");
  else if (Number(ajv) < 0) mark("avg_job_value", "Enter a positive number.");

  const cpw = val("calls_per_week");
  if (!cpw) mark("calls_per_week", "Enter a rough weekly call count.");
  else if (Number(cpw) < 0) mark("calls_per_week", "Enter a positive number.");

  // Call data: either a valid file, or no_export + a setup description.
  if (noExport.checked) {
    if (!val("phone_setup_description")) {
      mark("phone_setup_description", "Describe your phone setup so I have something to work from.");
    }
  } else if (fileBlocked) {
    mark("call_log", OVERSIZE_MESSAGE);
  } else if (!fileInput.files || !fileInput.files[0]) {
    mark("call_log", "Upload your call log, or tick the box below if you cannot export it.");
  }

  return { ok: !firstBad, firstBad: firstBad };
}

async function buildPayload() {
  let filename = null;
  let base64 = null;

  if (!noExport.checked && fileInput.files && fileInput.files[0] && !fileBlocked) {
    const file = fileInput.files[0];
    filename = file.name;
    base64 = await readFileAsBase64(file);
  }

  return {
    full_name: val("full_name"),
    email: val("email"),
    business_name: val("business_name"),
    phone: val("phone"),
    avg_job_value: val("avg_job_value"),
    calls_per_week: val("calls_per_week"),
    call_log_filename: filename,
    call_log_base64: base64,
    phone_setup_description: noExport.checked ? val("phone_setup_description") : null,
    booking_reason: val("booking_reason") || null,
    submitted_at: new Date().toISOString()
  };
}

function showSuccess() {
  form.hidden = true;
  failureEl.hidden = true;
  successEl.hidden = false;
  successEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showFailure() {
  failureEl.hidden = false;
  failureEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

retryBtn.addEventListener("click", function () {
  failureEl.hidden = true;
  submitBtn.disabled = false;
  submitBtn.textContent = "Submit";
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  failureEl.hidden = true;

  const result = validate();
  if (!result.ok) {
    if (result.firstBad && typeof result.firstBad.focus === "function") {
      result.firstBad.focus();
      result.firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending";

  let payload;
  try {
    payload = await buildPayload();
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
    setError("call_log", "Could not read that file. Try a different one, or tick the box below.");
    return;
  }

  try {
    const res = await fetch(N8N_INTAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    showSuccess();
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
    showFailure();
  }
});
