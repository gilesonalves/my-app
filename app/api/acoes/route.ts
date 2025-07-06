import { NextResponse } from "next/server";
import axios from "axios";

interface Acao {
  symbol: string;
  longName?: string;
  shortName?: string;
  regularMarketPrice: number;
  currency: string;
  regularMarketPreviousClose: number;
}

let cache: { timestamp: number; data: Acao[] | null } = {
  timestamp: 0,
  data: null,
};

const CACHE_TEMPO_MS = 60 * 1000; // 1 minuto de cache

export async function GET() {
  const agora = Date.now();

  if (cache.data && agora - cache.timestamp < CACHE_TEMPO_MS) {
    return NextResponse.json(cache.data);
  }

  const symbols = [
    "PETR4.SA",
    "TAEE4.SA",
    "ITSA3.SA",
    "BBAS3.SA",
    "MXRF11.SA",
    "HGLG11.SA",
  ];
  const url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes";

  try {
    if (!process.env.RAPIDAPI_KEY) {
      throw new Error("Chave RAPIDAPI_KEY não configurada");
    }

    const response = await axios.get(url, {
      params: {
        region: "BR",
        symbols: symbols.join(","),
      },
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
      },
    });

    if (
      !response.data ||
      !response.data.quoteResponse ||
      !response.data.quoteResponse.result
    ) {
      throw new Error("Resposta inválida da API Yahoo Finance");
    }

    const results: Acao[] = response.data.quoteResponse.result;

    const dadosFormatados = results.map((acao: Acao) => ({
      symbol: acao.symbol,
      longName: acao.longName || acao.shortName || "N/D",
      regularMarketPrice: acao.regularMarketPrice,
      currency: acao.currency,
      regularMarketPreviousClose: acao.regularMarketPreviousClose,
    }));

    cache = {
      timestamp: agora,
      data: dadosFormatados,
    };

    return NextResponse.json(dadosFormatados);
  } catch (error: unknown) {
    let message = "Erro desconhecido";

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    console.error("Erro na API Yahoo:", message);
    return NextResponse.json(
      { error: "Erro ao buscar ações: " + message },
      { status: 500 }
    );
  }
}
