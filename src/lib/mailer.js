import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    throw new Error("SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASSWORD must be configured");
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  return transporter;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));
}

export async function sendVerificationEmail(email, code, fullName = "there") {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const safeName = escapeHtml(fullName);
  await getTransporter().sendMail({
    from,
    to: email,
    subject: "Verify your ResumeAI email address",
    text: `Hi ${fullName}, your ResumeAI verification code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#172033">
        <h2>Verify your email</h2>
        <p>Hi ${safeName},</p>
        <p>Use this verification code to complete your ResumeAI registration:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f3f4ff;border-radius:12px;text-align:center">${code}</div>
        <p>This code expires in <strong>10 minutes</strong>. If you did not request it, you can ignore this email.</p>
        <p>— ResumeAI</p>
      </div>`,
  });
}
