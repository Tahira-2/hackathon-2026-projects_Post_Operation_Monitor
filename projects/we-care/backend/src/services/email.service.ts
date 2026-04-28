import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPatientPortalEmail(
  patientEmail: string,
  patientName: string,
  portalLink: string
) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'WeCare <noreply@wecare.app>',
    to: patientEmail,
    subject: 'Your Referral is Ready — Book Your Appointment',
    html: `
      <p>Hi ${patientName},</p>
      <p>Your doctor has sent you a referral. Click the link below to view your referral details and book your appointment:</p>
      <p><a href="${portalLink}">View My Referral</a></p>
      <p>This link expires in 7 days.</p>
      <p>— WeCare Team</p>
    `,
  });
}
