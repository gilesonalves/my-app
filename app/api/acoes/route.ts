import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

interface Acao {
  symbol: string;
  description: string;
  currentPrice: number;
  previousClose: number;
  currency: string;
}

const symbols = ["PETR4.SA", "TAEE4.SA", "ITSA4.SA", "BBAS3.SA", "MXRF11.SA", "HGLG11.SA"];

export async function GET() {
  try {
    const results: Acao[] = [];

    for (const symbol of symbols) {
      const quote = await yahooFinance.quote(symbol);

      results.push({
        symbol: symbol.replace(".SA", ""),
        description: quote.longName || quote.shortName || symbol,
        currentPrice: quote.regularMarketPrice || 0,
        previousClose: quote.regularMarketPreviousClose || 0,
        currency: quote.currency || "BRL",
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Erro ao buscar ações:", error);
    return NextResponse.json({ error: "Erro ao buscar ações" }, { status: 500 });
  }
}
