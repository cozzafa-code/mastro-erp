export const dynamic="force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "../tokens";

const GMAIL_API = "https://www.googleapis.com/gmail/v1/users/me";

function decodeBase64Url(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  try { return Buffer.from(padded, "base64").toString("utf-8"); } catch { return ""; }
}

function extractBody(payload: any): string {
  if (payload.body?.data) return decodeBase64Url(payload.body.data);
  if (payload.parts) {
    const plain = payload.parts.find((p: any) => p.mimeType === "text/plain");
    if (plain?.body?.data) return decodeBase64Url(plain.body.data);
    const html = payload.parts.find((p: any) => p.mimeType === "text/html");
    if (html?.body?.data) {
      const raw = decodeBase64Url(html.body.data);
      return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }
    for (const part of payload.parts) {
      if (part.parts) { const nested = extractBody(part); if (nested) return nested; }
    }
  }
  return "";
}

function getHeader(headers: any[], name: string): string {
  return headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}

function extractAttachments(payload: any): any[] {
  const atts: any[] = [];
  function walk(parts: any[]) {
    if (!parts) return;
    for (const p of parts) {
      if (p.filename && p.body?.attachmentId) atts.push({ filename: p.filename, mimeType: p.mimeType, size: p.body.size || 0, attachmentId: p.body.attachmentId });
      if (p.parts) walk(p.parts);
    }
  }
  walk(payload.parts || []);
  return atts;
}

export async function GET(req: NextRequest) {
  const token = await getValidAccessToken();
  if (!token) return NextResponse.json({ error: "Non connesso a Gmail" }, { status: 401 });
  const maxResults = req.nextUrl.searchParams.get("max") || "20";
  const pageToken = req.nextUrl.searchParams.get("page") || "";
  const query = req.nextUrl.searchParams.get("q") || "";
  try {
    let url = `${GMAIL_API}/messages?maxResults=${maxResults}&labelIds=INBOX`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    if (query) url += `&q=${encodeURIComponent(query)}`;
    const listRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const listData = await listRes.json();
    if (!listData.messages) return NextResponse.json({ messages: [], nextPage: null });
    const messages = await Promise.all(
      listData.messages.slice(0, 20).map(async (m: any) => {
        const msgRes = await fetch(`${GMAIL_API}/messages/${m.id}?format=full`, { headers: { Authorization: `Bearer ${token}` } });
        const msg = await msgRes.json();
        const hdrs = msg.payload?.headers || [];
        return {
          id: msg.id, threadId: msg.threadId,
          from: getHeader(hdrs, "From"), to: getHeader(hdrs, "To"),
          subject: getHeader(hdrs, "Subject"), date: getHeader(hdrs, "Date"),
          timestamp: parseInt(msg.internalDate || "0"),
          snippet: msg.snippet || "", body: extractBody(msg.payload),
          labels: msg.labelIds || [], unread: (msg.labelIds || []).includes("UNREAD"),
          attachments: extractAttachments(msg.payload),
        };
      })
    );
    return NextResponse.json({ messages, nextPage: listData.nextPageToken || null, total: listData.resultSizeEstimate || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
