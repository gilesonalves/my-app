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

let cache: { timestamp: number; data: Acao[] } | null = null;
const CACHE_TTL = 1000 * 60 * 2; // 2 minutos

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const promises = symbols.map(async (symbol) => {
      const quote = await yahooFinance.quote(symbol);

      return {
        symbol: symbol.replace(".SA", ""),
        description: quote?.longName || quote?.shortName || symbol,
        currentPrice: quote?.regularMarketPrice ?? 0,
        previousClose: quote?.regularMarketPreviousClose ?? 0,
        currency: quote?.currency || "BRL",
      };
    });

    const results = await Promise.all(promises);

    cache = {
      timestamp: Date.now(),
      data: results,
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error("Erro ao buscar ações:", error);
    return NextResponse.json({ error: "Erro ao buscar ações" }, { status: 500 });
  }
}
