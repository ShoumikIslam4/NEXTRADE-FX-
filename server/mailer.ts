import nodemailer from 'nodemailer';

export function isEmailServiceConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendLoginAlertEmail(params: {
  to: string;
  fullName: string;
  isNewRegistration?: boolean;
  ip?: string;
  userAgent?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return {
      sent: false,
      reason: 'SMTP_USER / SMTP_PASS environment variables not configured yet.'
    };
  }

  try {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });

    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    const subject = params.isNewRegistration
      ? 'Welcome to NEXTRADE FX — Account Created & Security Notice'
      : 'NEXTRADE FX Security Alert — New Sign-In Detected';

    const actionText = params.isNewRegistration
      ? 'Your new NEXTRADE FX account has been created and signed in.'
      : 'A new sign-in to your NEXTRADE FX account was just completed.';

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"NEXTRADE FX Security" <${user}>`,
      to: params.to,
      subject,
      text: `Hello ${params.fullName},\n\n${actionText}\n\nTime (BDT): ${timestamp}\nIP Address: ${params.ip || 'Unknown'}\nDevice: ${params.userAgent || 'Browser'}\n\nIf this was not you, please change your password immediately.\n\n— NEXTRADE FX Security Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0B1220; color: #F8FAFC; padding: 24px; border-radius: 12px; border: 1px solid #1E293B;">
          <h2 style="margin: 0 0 12px; color: #3B82F6;">NEXTRADE FX Security Alert</h2>
          <p style="font-size: 14px; color: #CBD5E1; line-height: 1.6;">
            Hello <strong>${params.fullName}</strong>,
          </p>
          <p style="font-size: 14px; color: #CBD5E1; line-height: 1.6;">
            ${actionText}
          </p>
          <div style="background: #111827; padding: 14px; border-radius: 8px; border: 1px solid #1E293B; margin: 16px 0; font-size: 12px; color: #94A3B8;">
            <div><strong>Account:</strong> ${params.to}</div>
            <div style="margin-top: 4px;"><strong>Time (Dhaka):</strong> ${timestamp}</div>
            <div style="margin-top: 4px;"><strong>IP Address:</strong> ${params.ip || 'Unknown'}</div>
            <div style="margin-top: 4px;"><strong>Device:</strong> ${(params.userAgent || 'Browser').slice(0, 90)}</div>
          </div>
          <p style="font-size: 12px; color: #64748B;">
            If this was you, no action is needed. Otherwise, change your password immediately from Security Settings.
          </p>
        </div>
      `
    });

    return { sent: true };
  } catch (err: any) {
    console.error('[Mailer] Failed to send email alert:', err?.message || err);
    return { sent: false, reason: err?.message || 'SMTP dispatch failed' };
  }
}
