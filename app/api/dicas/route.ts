import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

type Resultado = {
  simbolo: string;
  desempenho: number;
  recomendacao: string;
};

const simbolosAcoes = ["PETR4.SA", "VALE3.SA", "ITUB4.SA", "BBDC4.SA"];
const simbolosFiis = ["BCFF11.SA", "HGLG11.SA", "MXRF11.SA", "VISC11.SA"];

async function calcularDesempenho(symbol: string): Promise<Resultado> {
  try {
    const hoje = new Date();
    const umMesAtras = new Date();
    umMesAtras.setMonth(hoje.getMonth() - 1);

    const historico = await yahooFinance.historical(symbol, {
      period1: umMesAtras,
      period2: hoje,
    });

    if (!historico || historico.length === 0) {
      return { simbolo: symbol, desempenho: 0, recomendacao: "Sem dados" };
    }

    const precoInicial = historico[0].close;
    const precoFinal = historico[historico.length - 1].close;
    const desempenho = ((precoFinal - precoInicial) / precoInicial) * 100;

    let recomendacao = "Manter";
    if (desempenho > 5) recomendacao = "Comprar";
    else if (desempenho < -5) recomendacao = "Vender";

    return {
      simbolo: symbol,
      desempenho: Number(desempenho.toFixed(2)),
      recomendacao,
    };
  } catch {
    return { simbolo: symbol, desempenho: 0, recomendacao: "Erro ao analisar" };
  }
}

export async function GET() {
  const resultadosAcoes = await Promise.all(simbolosAcoes.map(calcularDesempenho));
  const resultadosFiis = await Promise.all(simbolosFiis.map(calcularDesempenho));

  return NextResponse.json({
    acoes: resultadosAcoes,
    fiis: resultadosFiis,
  });
}
