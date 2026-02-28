import { NextResponse } from "next/server";
import { getTokens, getValidAccessToken } from "../tokens";

export async function GET() {
  const tokens = getTokens();
  if (!tokens) return NextResponse.json({ connected: false });
  const accessToken = await getValidAccessToken();
  return NextResponse.json({ connected: !!accessToken, email: tokens.email });
}
