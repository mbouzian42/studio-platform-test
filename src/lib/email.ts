/**
 * Email sending via Resend (mock implementation).
 *
 * In production, initialize with:
 * import { Resend } from "resend";
 * const resend = new Resend(process.env.RESEND_API_KEY);
 *
 * For now, functions log and return success so the flow works
 * end-to-end without a real Resend API key.
 */

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: EmailParams): Promise<{ success: boolean }> {
  // Mock: log the email in development
  console.log(`[EMAIL MOCK] To: ${params.to} | Subject: ${params.subject}`);
  return { success: true };
}

export async function sendBookingConfirmation(params: {
  to: string;
  studioName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  depositAmount: number | null;
}): Promise<void> {
  const remaining = params.depositAmount
    ? params.totalPrice - params.depositAmount
    : 0;

  await sendEmail({
    to: params.to,
    subject: `Confirmation de réservation — ${params.studioName}`,
    html: `
      <h1>Réservation confirmée !</h1>
      <p>Studio : ${params.studioName}</p>
      <p>Date : ${params.date}</p>
      <p>Horaire : ${params.startTime} — ${params.endTime}</p>
      <p>Montant payé : ${params.depositAmount ?? params.totalPrice}€</p>
      ${remaining > 0 ? `<p>Reste à payer au studio : ${remaining}€</p>` : ""}
      <p>À bientôt chez Studio Platform !</p>
    `,
  });
}

export async function sendEngineerNotification(params: {
  to: string;
  studioName: string;
  date: string;
  startTime: string;
  endTime: string;
}): Promise<void> {
  await sendEmail({
    to: params.to,
    subject: `Nouvelle session assignée — ${params.studioName}`,
    html: `
      <h1>Nouvelle session</h1>
      <p>Studio : ${params.studioName}</p>
      <p>Date : ${params.date}</p>
      <p>Horaire : ${params.startTime} — ${params.endTime}</p>
    `,
  });
}
