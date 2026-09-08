import { db, FieldValue } from "./firebaseAdmin.js";

type EmailInput = {
  to: string;
  subject: string;
  text: string;
  referenceType: "MEMBER_REGISTRATION" | "WALLET_CREDIT" | "ADVERTISEMENT";
  referenceId: string;
};

type EmailResult = {
  status: "SENT" | "PENDING_CONFIGURATION" | "FAILED";
  messageId?: string;
};

function configuredSender() {
  return String(process.env.EMAIL_FROM || "").trim();
}

function emailAddress(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim()) ? value.trim().toLowerCase() : "";
}

export async function sendClubEmail(input: EmailInput): Promise<EmailResult> {
  const to = emailAddress(input.to);
  const from = configuredSender();
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const outbox = db.collection("emailOutbox").doc();
  const base = {
    to: input.to,
    subject: input.subject,
    text: input.text,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    createdAt: FieldValue.serverTimestamp()
  };

  if (!to || !from || !apiKey) {
    await outbox.set({ ...base, status: "PENDING_CONFIGURATION", reason: "Verified sender email is not configured." });
    return { status: "PENDING_CONFIGURATION" };
  }

  try {
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: input.subject,
        text: input.text
      })
    });
    const payload = await result.json().catch(() => ({})) as { id?: string; message?: string };
    if (!result.ok) throw new Error(payload.message || `Email provider returned ${result.status}.`);
    await outbox.set({ ...base, status: "SENT", provider: "RESEND", providerMessageId: payload.id || null, sentAt: FieldValue.serverTimestamp() });
    return { status: "SENT", messageId: payload.id };
  } catch (error) {
    await outbox.set({ ...base, status: "FAILED", error: error instanceof Error ? error.message : "Email provider request failed." });
    return { status: "FAILED" };
  }
}

export function moneyFromFils(amountFils: number) {
  return `BHD ${(Number(amountFils || 0) / 1000).toFixed(3)}`;
}
