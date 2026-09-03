/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: email-templates.mjs
  EXPECTED PROJECT PATH: /supabase/functions/_shared/email-templates.mjs
  ROLE: Central transactional-email subject, text, HTML, and prefilled-share-link templates.
  RESTORE/LOAD NOTE: Restore under supabase/functions/_shared/. Imported by send-transactional-email/index.ts; never place provider credentials here.
*/

const archiveUrl = "https://paragonarchive.com";
const supportEmail = "paragon.archive.2026@gmail.com";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

function buildMailto(subject, body, recipient = "") {
  return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function requestReceivedTemplate(payload = {}) {
  const websiteName = String(payload.websiteName || "").trim();
  const ideaLine = websiteName ? `\n\nYour request: ${websiteName}` : "";
  const shareSubject = "You should see Paragon Archive 💡";
  const shareBody = `I found Paragon Archive — a growing collection of free websites and tools. You can also request what they build next.\n\n${archiveUrl}`;
  const shareUrl = buildMailto(shareSubject, shareBody);
  const subject = "We got your idea 💡 — Paragon Archive";
  const text = `Hey there,

Thank you for submitting your website request to Paragon Archive. We genuinely appreciate you taking the time to share your idea with us — this is exactly how we decide what to build next.${ideaLine}

Here is what happens now:

We review every request personally.
Our team reads through all submissions and the most requested and most impactful ideas move to the top of our build queue. If your idea already exists as a planned or in-progress website we will work to get it live as soon as possible.

There is no fixed timeline.
We build when we are ready to build it right. Paragon is about quality and we will not rush something just to get it out.

If you left your email
we will send you a message the moment your requested website goes live on Paragon Archive. Watch your inbox.

Want to speed things up?
Share Paragon Archive with others. The more people who request the same idea the faster it climbs our priority list.

Thank you for being part of what we are building. Every great thing started with someone saying "I wish this existed." You just said it.

Stay exceptional.

The Paragon Team
${supportEmail}
${archiveUrl}`;

  const ideaHTML = websiteName ? `<p style="margin:18px 0;padding:12px 14px;border-radius:12px;background:#f3f6ff;color:#334155;"><strong>Your request:</strong> ${escapeHTML(websiteName)}</p>` : "";
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(subject)}</title></head>
<body style="margin:0;background:#f4f5f7;color:#17171c;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Thank you for helping decide what Paragon builds next.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">
        <tr><td style="padding:26px 30px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#ffffff;">
          <div style="font-size:13px;font-weight:700;letter-spacing:.12em;">PARAGON ARCHIVE</div>
          <h1 style="margin:12px 0 0;font-size:30px;line-height:1.15;">We got your idea 💡</h1>
        </td></tr>
        <tr><td style="padding:30px;color:#334155;font-size:16px;line-height:1.7;">
          <p style="margin:0 0 16px;">Hey there,</p>
          <p style="margin:0 0 16px;">Thank you for submitting your website request to Paragon Archive. We genuinely appreciate you taking the time to share your idea with us — this is exactly how we decide what to build next.</p>
          ${ideaHTML}
          <p style="margin:22px 0 12px;color:#111827;font-weight:700;">Here is what happens now:</p>
          <p style="margin:0 0 16px;"><strong style="color:#111827;">We review every request personally.</strong><br>Our team reads through all submissions and the most requested and most impactful ideas move to the top of our build queue. If your idea already exists as a planned or in-progress website we will work to get it live as soon as possible.</p>
          <p style="margin:0 0 16px;"><strong style="color:#111827;">There is no fixed timeline.</strong><br>We build when we are ready to build it right. Paragon is about quality and we will not rush something just to get it out.</p>
          <p style="margin:0 0 16px;"><strong style="color:#111827;">If you left your email</strong><br>we will send you a message the moment your requested website goes live on Paragon Archive. Watch your inbox.</p>
          <p style="margin:0 0 16px;"><strong style="color:#111827;">Want to speed things up?</strong><br>Share Paragon Archive with others. The more people who request the same idea the faster it climbs our priority list.</p>
          <p style="margin:22px 0 16px;">Thank you for being part of what we are building. Every great thing started with someone saying <em>“I wish this existed.”</em> You just said it.</p>
          <p style="margin:0 0 22px;">Stay exceptional.</p>
          <p style="margin:0;"><strong style="color:#111827;">The Paragon Team</strong><br><a href="mailto:${supportEmail}" style="color:#2563eb;">${supportEmail}</a><br><a href="${archiveUrl}" style="color:#2563eb;">paragonarchive.com</a></p>
          <p style="margin:26px 0 0;"><a href="${shareUrl}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#ffffff;font-weight:700;text-decoration:none;">Share Paragon Archive by email</a></p>
          <p style="margin:10px 0 0;color:#64748b;font-size:12px;">The button opens your email app with a subject and message prepared. You review it and choose Send.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html, replyTo: supportEmail };
}

function supportNotificationTemplate(payload = {}) {
  const name = String(payload.name || "Support visitor").trim();
  const email = String(payload.email || "").trim();
  const topic = String(payload.topic || "Support").trim();
  const message = String(payload.message || "").trim();
  const attachmentPath = String(payload.attachmentPath || "").trim();
  const attachmentName = String(payload.attachmentName || "").trim();
  const userAgent = String(payload.userAgent || "").trim();
  const supportId = String(payload.supportId || "").trim();
  const subject = `[${topic}] Support message from ${name}`;
  const replySubject = `Re: ${topic} — Paragon Archive Support`;
  const replyBody = `Hi ${name},\n\nThank you for contacting Paragon Archive.\n\n`;
  const replyUrl = buildMailto(replySubject, replyBody, email);
  const attachmentLine = attachmentPath ? `\nAttachment: ${attachmentName || "Screenshot"}\nPrivate Storage path: support-attachments/${attachmentPath}` : "\nAttachment: None";
  const text = `New Help & Support message\n\nTopic: ${topic}\nName: ${name}\nEmail: ${email}\nSupport ID: ${supportId}\n\nMessage:\n${message}${attachmentLine}\n\nDevice/browser:\n${userAgent || "Not supplied"}\n\nReply directly to this email or compose a response to ${email}.`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(subject)}</title></head><body style="margin:0;background:#f4f5f7;color:#17171c;font-family:Arial,Helvetica,sans-serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;background:#f4f5f7;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;overflow:hidden;border:1px solid #e5e7eb;border-radius:18px;background:#ffffff;"><tr><td style="padding:24px 28px;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#ffffff;"><div style="font-size:12px;font-weight:700;letter-spacing:.12em;">PARAGON HELP &amp; SUPPORT</div><h1 style="margin:10px 0 0;font-size:26px;">${escapeHTML(topic)}</h1></td></tr><tr><td style="padding:28px;color:#334155;font-size:15px;line-height:1.65;"><p style="margin:0 0 6px;"><strong>Name:</strong> ${escapeHTML(name)}</p><p style="margin:0 0 6px;"><strong>Email:</strong> <a href="mailto:${escapeHTML(email)}" style="color:#2563eb;">${escapeHTML(email)}</a></p><p style="margin:0 0 18px;"><strong>Support ID:</strong> ${escapeHTML(supportId)}</p><div style="padding:16px;border-radius:12px;background:#f8fafc;white-space:pre-wrap;">${escapeHTML(message)}</div><p style="margin:18px 0 6px;"><strong>Screenshot:</strong> ${attachmentPath ? `${escapeHTML(attachmentName || "Attached")}<br><span style="font-size:12px;color:#64748b;">Private path: support-attachments/${escapeHTML(attachmentPath)}</span>` : "None"}</p><p style="margin:6px 0 20px;"><strong>Device/browser:</strong><br><span style="font-size:12px;color:#64748b;">${escapeHTML(userAgent || "Not supplied")}</span></p><a href="${replyUrl}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#ffffff;font-weight:700;text-decoration:none;">Reply to ${escapeHTML(name)}</a><p style="margin:10px 0 0;color:#64748b;font-size:12px;">This opens a prepared reply in your email app. Review it and choose Send.</p></td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html, replyTo: email || supportEmail };
}

const templates = {
  "request-received": requestReceivedTemplate,
  "support-notification": supportNotificationTemplate
};

export function getEmailTemplate(templateKey, payload = {}) {
  const builder = templates[String(templateKey || "")];
  if (!builder) throw new Error(`Unknown email template: ${templateKey}`);
  return builder(payload);
}

export { buildMailto, requestReceivedTemplate };
