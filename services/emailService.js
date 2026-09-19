import nodemailer from "nodemailer";
import { env } from "../env.js";

/**
 * Creates a nodemailer transporter using environment variables.
 * If SMTP credentials are not configured, logs the email to console cleanly.
 */
let transporter = null;

if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || "smtp.gmail.com",
    port: Number(env.SMTP_PORT) || 587,
    secure: Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

/**
 * Send an email notification for a user feedback, bug report, or suggestion.
 *
 * @param {Object} param0
 * @param {string} param0.name - Sender's name
 * @param {string} param0.email - Sender's email
 * @param {string} param0.type - Type of feedback ('suggestion', 'report', 'feedback', 'inappropriate')
 * @param {string} param0.subject - Feedback subject
 * @param {string} param0.message - Feedback message
 */
export const sendFeedbackEmail = async ({ name, email, type, subject, message }) => {
  const recipient = env.FEEDBACK_RECEIVER_EMAIL || "manishrimal100@gmail.com";
  const emailSubject = `[Re-Nest ${type ? type.toUpperCase() : "FEEDBACK"}] ${subject}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 0; padding: 20px; background-color: #f8fafc; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #047857; color: #ffffff; padding: 24px; }
          .header h1 { margin: 0; font-size: 20px; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; background: rgba(255,255,255,0.2); font-size: 11px; font-weight: bold; text-transform: uppercase; margin-top: 8px; }
          .content { padding: 24px; }
          .field { margin-bottom: 16px; }
          .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
          .value { font-size: 14px; font-weight: 500; }
          .message-box { background: #f1f5f9; padding: 16px; border-radius: 12px; border-left: 4px solid #047857; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
          .footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>New User Feedback / Report Received</h1>
            <span class="badge">${type}</span>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Sender Name</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Sender Email</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            <div class="field">
              <div class="label">Subject</div>
              <div class="value"><strong>${subject}</strong></div>
            </div>
            <div class="field">
              <div class="label">Message / Details</div>
              <div class="message-box">${message}</div>
            </div>
          </div>
          <div class="footer">
            Re-Nest Platform Notification • Received at ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })}
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
[Re-Nest New ${type ? type.toUpperCase() : "FEEDBACK"}]
Subject: ${subject}
From: ${name} (${email})
Type: ${type}
Time: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })}

Message:
${message}
  `.trim();

  // If SMTP is configured, send the email
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Re-Nest Feedback" <${env.SMTP_USER}>`,
        to: recipient,
        replyTo: email,
        subject: emailSubject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[EMAIL DISPATCHED] Message ID: ${info.messageId} to ${recipient}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error("[EMAIL ERROR] Failed to send via SMTP:", err);
      // Return gracefully so submission succeeds
      return { success: false, error: err.message };
    }
  } else {
    // If SMTP credentials not provided, log cleanly to server console
    console.log("------------------------------------------------------------");
    console.log(`📨 [FEEDBACK EMAIL LOG] Notification for ${recipient}:`);
    console.log(`   Type: ${type} | From: ${name} <${email}>`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Message: ${message}`);
    console.log("   (Configure SMTP_USER & SMTP_PASS in .env to send real emails via SMTP)");
    console.log("------------------------------------------------------------");
    return { success: true, logged: true };
  }
};

/**
 * Send an email notification for a user review or rating.
 *
 * @param {Object} param0
 * @param {string} param0.username - Reviewer's username
 * @param {string} param0.userEmail - Reviewer's email
 * @param {number} param0.rating - Rating out of 5
 * @param {string} param0.comment - Review text
 * @param {string} param0.experienceType - 'donation' | 'receiver' | 'general'
 * @param {string} [param0.productName] - Associated product name if any
 */
export const sendReviewEmail = async ({
  username,
  userEmail,
  rating,
  comment,
  experienceType = "general",
  productName = "Platform",
}) => {
  const recipient = env.FEEDBACK_RECEIVER_EMAIL || "manishrimal100@gmail.com";
  const typeLabel =
    experienceType === "donation"
      ? "Donor Experience"
      : experienceType === "receiver"
      ? "Receiver Experience"
      : "Community Review";

  const stars = "★".repeat(Math.max(1, Math.min(5, rating))) + "☆".repeat(Math.max(0, 5 - Math.max(1, Math.min(5, rating))));
  const emailSubject = `[Re-Nest ${typeLabel.toUpperCase()}] ${stars} (${rating}/5 Stars) from ${username}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 0; padding: 20px; background-color: #f8fafc; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #059669; color: #ffffff; padding: 24px; }
          .header h1 { margin: 0; font-size: 20px; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; background: rgba(255,255,255,0.25); font-size: 11px; font-weight: bold; text-transform: uppercase; margin-top: 8px; }
          .content { padding: 24px; }
          .rating-badge { font-size: 24px; color: #f59e0b; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; font-weight: bold; }
          .rating-score { background: #fef3c7; color: #b45309; padding: 4px 12px; border-radius: 8px; font-size: 16px; }
          .field { margin-bottom: 16px; }
          .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
          .value { font-size: 14px; font-weight: 500; }
          .review-box { background: #f1f5f9; padding: 16px; border-radius: 12px; border-left: 4px solid #059669; font-size: 14px; line-height: 1.6; font-style: italic; white-space: pre-wrap; }
          .footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>New User Review & Rating Received</h1>
            <span class="badge">${typeLabel}</span>
          </div>
          <div class="content">
            <div class="rating-badge">
              <span>${stars}</span>
              <span class="rating-score">${rating} / 5</span>
            </div>
            <div class="field">
              <div class="label">Reviewer</div>
              <div class="value">${username} (${userEmail})</div>
            </div>
            ${
              productName && productName !== "Platform"
                ? `<div class="field">
                    <div class="label">Product / Donation Item</div>
                    <div class="value"><strong>${productName}</strong></div>
                  </div>`
                : ""
            }
            <div class="field">
              <div class="label">Experience Type</div>
              <div class="value">${typeLabel}</div>
            </div>
            <div class="field">
              <div class="label">Review / Comments</div>
              <div class="review-box">${comment || "(No written comment provided)"}</div>
            </div>
          </div>
          <div class="footer">
            Re-Nest Platform Notification • Received at ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })}
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
[Re-Nest New Review - ${typeLabel}]
Rating: ${rating}/5 Stars (${stars})
Reviewer: ${username} (${userEmail})
${productName && productName !== "Platform" ? `Product: ${productName}\n` : ""}Experience Type: ${typeLabel}
Time: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })}

Review / Comments:
${comment || "(No written comment provided)"}
  `.trim();

  // If SMTP is configured, send the email
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Re-Nest Reviews" <${env.SMTP_USER}>`,
        to: recipient,
        replyTo: userEmail,
        subject: emailSubject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[REVIEW EMAIL DISPATCHED] Message ID: ${info.messageId} to ${recipient}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error("[REVIEW EMAIL ERROR] Failed to send via SMTP:", err);
      return { success: false, error: err.message };
    }
  } else {
    console.log("------------------------------------------------------------");
    console.log(`⭐ [REVIEW EMAIL LOG] Notification for ${recipient}:`);
    console.log(`   Type: ${typeLabel} | Rating: ${rating}/5 | By: ${username} <${userEmail}>`);
    if (productName && productName !== "Platform") console.log(`   Product: ${productName}`);
    console.log(`   Comment: ${comment || "(None)"}`);
    console.log("   (Configure SMTP_USER & SMTP_PASS in .env to send real emails via SMTP)");
    console.log("------------------------------------------------------------");
    return { success: true, logged: true };
  }
};
