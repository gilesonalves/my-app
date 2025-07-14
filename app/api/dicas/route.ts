// import { NextResponse } from "next/server";
// import yahooFinance from "yahoo-finance2";

// interface Dividendo {
//   amount: number;
//   date: string | Date;
// }

// interface HistoricalEvent {
//   type: string;
//   dividends?: number;
//   amount?: number;
//   date: string | Date;
//   [key: string]: unknown;
// }

// type Resultado = {
//   ticker: string;
//   desempenho: string;
//   dividendos: string;
//   recomendacao: string;
// };

// const acoes = ["PETR4.SA", "TAEE4.SA", "ITSA4.SA"];
// const fiis = ["MXRF11.SA", "HGLG11.SA"];

// export async function GET() {
//   try {
//     const hoje = new Date();
//     const umMesAtras = new Date();
//     umMesAtras.setMonth(hoje.getMonth() - 1);

//     const resultadosAcoes: Resultado[] = [];
//     const resultadosFiis: Resultado[] = [];
//     let totalDividendos = 0;

//     function filtrarDividendosUltimoMes(dividends: Dividendo[]) {
//       return dividends.filter((div) => {
//         const dataDiv = new Date(div.date);
//         return dataDiv >= umMesAtras && dataDiv <= hoje;
//       });
//     }

//     async function obterDividendos(
//       symbol: string,
//       period1: string,
//       period2: string
//     ): Promise<Dividendo[]> {
//       try {
//         const res = await yahooFinance.historical(symbol, {
//           period1: new Date(period1),
//           period2: new Date(period2),
//           events: "dividends",
//         }) as Array<Partial<HistoricalEvent>>;

//         if (!res) return [];

//         const dividends = res.filter(
//           (item) => item.type === "DIVIDEND" || item.dividends !== undefined
//         );

//         return dividends
//           .filter((d) => d.date !== undefined)
//           .map((d) => ({
//             amount: d.dividends ?? d.amount ?? 0,
//             date: d.date as string | Date,
//           }));
//       } catch {
//         return [];
//       }
//     }

//     for (const symbol of acoes) {
//       const history = await yahooFinance.historical(symbol, {
//         period1: umMesAtras,
//         period2: hoje,
//       });

//       const allDividends = await obterDividendos(
//         symbol,
//         umMesAtras.toISOString(),
//         hoje.toISOString()
//       );
//       const dividends = filtrarDividendosUltimoMes(allDividends);

//       const precoInicial = history?.length ? history[0].close : 0;
//       const precoFinal = history?.length ? history[history.length - 1].close : 0;
//       const variacao =
//         precoInicial > 0 ? ((precoFinal - precoInicial) / precoInicial) * 100 : 0;

//       const dividendosPagos =
//         dividends.length > 0
//           ? dividends.reduce((soma, item) => soma + (item.amount || 0), 0)
//           : 0;

//       totalDividendos += dividendosPagos;

//       resultadosAcoes.push({
//         ticker: symbol.replace(".SA", ""),
//         desempenho: variacao.toFixed(2),
//         dividendos: dividendosPagos.toFixed(2),
//         recomendacao:
//           dividendosPagos > 0
//             ? "Recebeu dividendos no último mês. Potencial para valor e renda."
//             : "Sem dividendos recentes. Avalie o histórico antes de aportar.",
//       });
//     }

//     for (const symbol of fiis) {
//       const history = await yahooFinance.historical(symbol, {
//         period1: umMesAtras,
//         period2: hoje,
//       });

//       const allDividends = await obterDividendos(
//         symbol,
//         umMesAtras.toISOString(),
//         hoje.toISOString()
//       );
//       const dividends = filtrarDividendosUltimoMes(allDividends);

//       const precoInicial = history?.length ? history[0].close : 0;
//       const precoFinal = history?.length ? history[history.length - 1].close : 0;
//       const variacao =
//         precoInicial > 0 ? ((precoFinal - precoInicial) / precoInicial) * 100 : 0;

//       const dividendosPagos =
//         dividends.length > 0
//           ? dividends.reduce((soma, item) => soma + (item.amount || 0), 0)
//           : 0;

//       totalDividendos += dividendosPagos;

//       resultadosFiis.push({
//         ticker: symbol.replace(".SA", ""),
//         desempenho: variacao.toFixed(2),
//         dividendos: dividendosPagos.toFixed(2),
//         recomendacao:
//           dividendosPagos > 0
//             ? "Recebeu dividendos no último mês. Ideal para renda passiva."
//             : "Sem dividendos recentes.",
//       });
//     }

//     return NextResponse.json({
//       acoes: resultadosAcoes,
//       fiis: resultadosFiis,
//       totalDividendos: totalDividendos.toFixed(2),
//     });
//   } catch (error) {
//     console.error("Erro ao buscar dicas:", error);
//     return NextResponse.json({ error: "Erro ao buscar dicas" }, { status: 500 });
//   }
// }
