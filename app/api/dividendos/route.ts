import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    mensagem: "A funcionalidade de dividendos foi desativada.",
  });
}
