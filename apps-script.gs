/**
 * WeOffer Growth — landing page lead capture
 * Receives form submissions and appends them as a new row in a Google Sheet.
 * Also emails you a notification on every new lead.
 *
 * ============================================================
 *  HOW TO DEPLOY (one-time, ~5 minutes)
 * ============================================================
 *
 *  1. Open https://sheets.new (creates a fresh Google Sheet).
 *     Rename it something like "WeOffer Leads".
 *
 *  2. In that sheet, click  Extensions → Apps Script.
 *     Delete everything in the editor and paste THIS ENTIRE FILE in.
 *
 *  3. Edit the CONFIG block below:
 *        - NOTIFY_EMAIL : where new-lead alerts should go
 *        - SHEET_NAME   : the tab name (default "Leads"; the script
 *                         creates it for you on first run)
 *
 *  4. Click  💾 Save  (top toolbar).
 *
 *  5. Click  Deploy → New deployment.
 *        - Gear icon → choose "Web app"
 *        - Description: "WeOffer landing form"
 *        - Execute as:        Me (your Google account)
 *        - Who has access:    Anyone        ← important! must be Anyone
 *        - Click  Deploy
 *        - Authorise the script when Google asks
 *          (it will warn "unverified" — click Advanced → "Go to project (unsafe)" → Allow)
 *
 *  6. Google gives you a URL like:
 *        https://script.google.com/macros/s/AKfycb.../exec
 *     COPY that URL.
 *
 *  7. Open  index.html  and  landing.html  and replace
 *        data-sheet="PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE"
 *     with the URL from step 6. Save & upload to Hostinger.
 *
 *  Done — every form submission now appends a row to your sheet
 *  AND emails NOTIFY_EMAIL.
 *
 *  ⚠️  If you ever edit this script: you MUST click
 *      Deploy → Manage deployments → ✏️ pencil → Version: "New version" → Deploy.
 *      Otherwise the live web app keeps running the old code.
 *
 * ============================================================
 */

// ---- CONFIG (edit these) ------------------------------------
const CONFIG = {
  SHEET_NAME:    'Leads',
  NOTIFY_EMAIL:  'weoffer.info@gmail.com',
  SEND_EMAIL:    true,                      // set false to disable email alerts
  COLUMNS: [
    'Timestamp',
    'Source',          // 'landing' or 'main-site'
    'Name',
    'Email',
    'Phone',
    'Business',
    'Message',
    'Page URL',
    'Referrer',
    'IP / UA'
  ]
};
// -------------------------------------------------------------


/**
 * doPost — entry point for form submissions.
 * The form on the site POSTs a FormData payload (no JSON, no preflight).
 */
function doPost(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};

    const row = [
      new Date(),
      params.source         || '',
      params.name           || '',
      params.email          || '',
      params.phone          || '',
      params.business       || '',
      params.message || params.pain || '',
      params.page           || '',
      params.referrer       || '',
      ((e && e.parameter && e.parameter.userAgent) ? e.parameter.userAgent : '')
    ];

    const sheet = getOrCreateSheet_();
    sheet.appendRow(row);

    if (CONFIG.SEND_EMAIL && CONFIG.NOTIFY_EMAIL) {
      sendNotification_(params);
    }

    return jsonResponse_({ ok: true });
  } catch (err) {
    console.error(err);
    return jsonResponse_({ ok: false, error: String(err) });
  }
}


/**
 * doGet — quick health check.
 * Visit the web app URL in your browser; you should see {"ok":true,"hint":"POST only"}.
 */
function doGet() {
  return jsonResponse_({
    ok: true,
    hint: 'POST only — submit the contact form on the WeOffer site to add a row.'
  });
}


// ---- helpers ------------------------------------------------

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.appendRow(CONFIG.COLUMNS);
    sheet.getRange(1, 1, 1, CONFIG.COLUMNS.length)
         .setFontWeight('bold')
         .setBackground('#000000')
         .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, CONFIG.COLUMNS.length);
  }
  return sheet;
}

function sendNotification_(p) {
  const subject = `New ${p.source || 'site'} lead — ${p.name || 'unknown'}`;
  const body =
    'A new lead just came in on weoffer.in:\n\n' +
    `Name:     ${p.name || ''}\n` +
    `Email:    ${p.email || ''}\n` +
    `Phone:    ${p.phone || ''}\n` +
    `Business: ${p.business || ''}\n` +
    `Source:   ${p.source || ''}\n` +
    `Page:     ${p.page || ''}\n` +
    `Referrer: ${p.referrer || ''}\n\n` +
    'Message:\n' +
    (p.message || p.pain || '') + '\n\n' +
    '— sent automatically by Apps Script';

  MailApp.sendEmail(CONFIG.NOTIFY_EMAIL, subject, body);
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
