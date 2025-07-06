import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const symbols = ["PETR4", "VALE3", "ITUB4"];
  const resultados: unknown[] = [];

  for (const symbol of symbols) {
    try {
      const res = await axios.get("https://api.hgbrasil.com/finance/stock_price", {
        params: {
          key: process.env.HG_API_KEY,
          symbol,
        },
      });

      const acao = res.data.results?.[symbol];

      if (!acao || acao.error) continue;

      resultados.push({
        symbol: acao.symbol,
        longName: acao.name,
        regularMarketPrice: acao.price,
        regularMarketPreviousClose: acao.previous_close,
        currency: "R$",
      });
    } catch (error) {
      console.error(`Erro ao buscar ${symbol}:`, error);
    }
  }

  return NextResponse.json(resultados);
}
