import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const TOKEN_DIR = join(process.cwd(), ".gmail-tokens");
const TOKEN_FILE = join(TOKEN_DIR, "tokens.json");

export interface GmailTokens {
  access_token: string;
  refresh_token: string;
  expiry: number;
  email: string;
}

export function getTokens(): GmailTokens | null {
  if (!existsSync(TOKEN_FILE)) return null;
  try { return JSON.parse(readFileSync(TOKEN_FILE, "utf-8")); } catch { return null; }
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens) return null;
  if (tokens.expiry > Date.now() + 300000) return tokens.access_token;
  const clientId = process.env.GMAIL_CLIENT_ID!;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET!;
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: tokens.refresh_token, grant_type: "refresh_token" }),
    });
    const data = await res.json();
    if (data.access_token) {
      tokens.access_token = data.access_token;
      tokens.expiry = Date.now() + (data.expires_in * 1000);
      writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
      return tokens.access_token;
    }
  } catch {}
  return null;
}
