import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import dayjs from "dayjs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const period = searchParams.get("period") || "30d"; // Ex: 7d, 1y, 90d, etc.

    if (!symbol) {
      return NextResponse.json({ error: "Symbol é obrigatório" }, { status: 400 });
    }

    // Calcula period1 com base no período solicitado
    const hoje = dayjs();
    let period1 = hoje;

    const match = period.match(/^(\d+)([dwmy])$/); // Regex para d=dias, w=semanas, m=meses, y=anos
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      switch (unit) {
        case "d":
          period1 = hoje.subtract(value, "day");
          break;
        case "w":
          period1 = hoje.subtract(value * 7, "day");
          break;
        case "m":
          period1 = hoje.subtract(value, "month");
          break;
        case "y":
          period1 = hoje.subtract(value, "year");
          break;
      }
    } else {
      // Se o período for inválido, retorna erro
      return NextResponse.json({ error: "Período inválido. Use formatos como 30d, 3m, 1y..." }, { status: 400 });
    }

    const result = await yahooFinance.historical(symbol, {
      period1: period1.toDate(),
      period2: hoje.toDate(),
      interval: "1d",
    });

    if (!result || result.length === 0) {
      return NextResponse.json({ prices: [] });
    }

    const prices = result.map((item) => ({
      date: item.date.toISOString().split("T")[0],
      close: item.close,
    }));

    return NextResponse.json({ prices });
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json({ error: "Erro ao buscar histórico" }, { status: 500 });
  }
}
