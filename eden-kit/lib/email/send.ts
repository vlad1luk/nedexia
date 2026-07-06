/**
 * Envoi d'e-mail transactionnel via Resend (déjà utilisé pour la waitlist).
 * Dégradé proprement : sans RESEND_API_KEY, renvoie false sans erreur — le
 * reste du suivi (notification in-app) continue de fonctionner.
 */

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  from?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const from =
    input.from ||
    process.env.EDEN_FROM_EMAIL ||
    process.env.WAITLIST_FROM_EMAIL ||
    "Eden de Nedexia <eden@nedexia.com>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
