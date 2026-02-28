import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const TOKEN_DIR = join(process.cwd(), ".gmail-tokens");
const TOKEN_FILE = join(TOKEN_DIR, "tokens.json");

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  if (error) return NextResponse.redirect(new URL("/dashboard?gmail=error&msg=" + error, req.url));
  if (!code) return NextResponse.redirect(new URL("/dashboard?gmail=error&msg=no_code", req.url));
  const clientId = process.env.GMAIL_CLIENT_ID!;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET!;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || "http://localhost:3000/api/gmail/callback";
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
    });
    const tokens = await tokenRes.json();
    if (tokens.error) return NextResponse.redirect(new URL("/dashboard?gmail=error&msg=" + tokens.error, req.url));
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const user = await userRes.json();
    if (!existsSync(TOKEN_DIR)) mkdirSync(TOKEN_DIR, { recursive: true });
    writeFileSync(TOKEN_FILE, JSON.stringify({ access_token: tokens.access_token, refresh_token: tokens.refresh_token, expiry: Date.now() + (tokens.expires_in * 1000), email: user.email }, null, 2));
    return NextResponse.redirect(new URL(`/dashboard?gmail=ok&email=${user.email}`, req.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL("/dashboard?gmail=error&msg=" + err.message, req.url));
  }
}
