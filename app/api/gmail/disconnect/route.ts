export const dynamic="force-dynamic";
import { NextResponse } from "next/server";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";

export async function POST() {
  const tokenFile = join(process.cwd(), ".gmail-tokens", "tokens.json");
  if (existsSync(tokenFile)) unlinkSync(tokenFile);
  return NextResponse.json({ disconnected: true });
}
