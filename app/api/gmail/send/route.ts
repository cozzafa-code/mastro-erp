import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken, getTokens } from "../tokens";

export async function POST(req: NextRequest) {
  const token = await getValidAccessToken();
  if (!token) return NextResponse.json({ error: "Non connesso" }, { status: 401 });
  const { to, subject, body, replyTo, threadId } = await req.json();
  if (!to || !subject) return NextResponse.json({ error: "Destinatario e oggetto obbligatori" }, { status: 400 });
  const tokens = getTokens();
  const fromEmail = tokens?.email || "";
  const hdrs = [`From: ${fromEmail}`, `To: ${to}`, `Subject: ${subject}`, "MIME-Version: 1.0", 'Content-Type: text/plain; charset="UTF-8"'];
  if (replyTo) { hdrs.push(`In-Reply-To: ${replyTo}`); hdrs.push(`References: ${replyTo}`); }
  const rawMessage = hdrs.join("\r\n") + "\r\n\r\n" + body;
  const encoded = Buffer.from(rawMessage).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  try {
    const sendBody: any = { raw: encoded };
    if (threadId) sendBody.threadId = threadId;
    const res = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(sendBody),
    });
    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
    return NextResponse.json({ success: true, id: data.id, threadId: data.threadId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
