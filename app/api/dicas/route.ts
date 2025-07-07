import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
// import type { Dividend } from "yahoo-finance2";

const acoes = ["PETR4.SA", "TAEE4.SA", "ITSA4.SA", "BBAS3.SA"];
const fiis = ["MXRF11.SA", "HGLG11.SA"];

export async function GET() {
  try {
    const hoje = new Date();
    const umMesAtras = new Date();
    umMesAtras.setMonth(hoje.getMonth() - 1);

    const resultadosAcoes = [];
    const resultadosFiis = [];
    let totalDividendos = 0;

    function filtrarDividendosUltimoMes(dividends: any[]) {
      return dividends.filter((div) => {
        const dataDiv = new Date(div.date);
        return dataDiv >= umMesAtras && dataDiv <= hoje;
      });
    }

async function obterDividendos(symbol: string, period1?: string, period2?: string): Promise<any[]> {
  try {
    const res = await yahooFinance.dividends(symbol, {
      period1,
      period2,
    });
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if ("dividends" in res && Array.isArray(res.dividends)) return res.dividends;
    return [];
  } catch {
    return [];
  }
}

    for (const symbol of acoes) {
      const history = await yahooFinance.historical(symbol, {
        period1: umMesAtras.toISOString(),
        period2: hoje.toISOString(),
      });

      const allDividends = await obterDividendos(symbol, umMesAtras.toISOString(), hoje.toISOString());
            const dividends = filtrarDividendosUltimoMes(allDividends);

      const precoInicial = history?.length ? history[0].close : 0;
      const precoFinal = history?.length ? history[history.length - 1].close : 0;
      const variacao = precoInicial > 0 ? ((precoFinal - precoInicial) / precoInicial) * 100 : 0;

      const dividendosPagos = dividends.length > 0
        ? dividends.reduce((soma, item) => soma + (item.amount || 0), 0)
        : 0;

      totalDividendos += dividendosPagos;

      resultadosAcoes.push({
        ticker: symbol.replace(".SA", ""),
        desempenho: variacao.toFixed(2),
        dividendos: dividendosPagos.toFixed(2),
        recomendacao:
          dividendosPagos > 0
            ? "Recebeu dividendos no último mês. Potencial para valor e renda."
            : "Sem dividendos recentes. Avalie o histórico antes de aportar.",
      });
    }

    for (const symbol of fiis) {
      const history = await yahooFinance.historical(symbol, {
        period1: umMesAtras.toISOString(),
        period2: hoje.toISOString(),
      });

      const allDividends = await obterDividendos(symbol);
      const dividends = filtrarDividendosUltimoMes(allDividends);

      const precoInicial = history?.length ? history[0].close : 0;
      const precoFinal = history?.length ? history[history.length - 1].close : 0;
      const variacao = precoInicial > 0 ? ((precoFinal - precoInicial) / precoInicial) * 100 : 0;

      const dividendosPagos = dividends.length > 0
        ? dividends.reduce((soma, item) => soma + (item.amount || 0), 0)
        : 0;

      totalDividendos += dividendosPagos;

      resultadosFiis.push({
        ticker: symbol.replace(".SA", ""),
        desempenho: variacao.toFixed(2),
        dividendos: dividendosPagos.toFixed(2),
        recomendacao:
          dividendosPagos > 0
            ? "Recebeu dividendos no último mês. Ideal para renda passiva."
            : "Sem dividendos recentes.",
      });
    }

    return NextResponse.json({
      acoes: resultadosAcoes,
      fiis: resultadosFiis,
      totalDividendos: totalDividendos.toFixed(2),
    });
  } catch (error) {
    console.error("Erro ao buscar dicas:", error);
    return NextResponse.json({ error: "Erro ao buscar dicas" }, { status: 500 });
  }
}
