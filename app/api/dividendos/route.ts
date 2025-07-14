// import { NextResponse } from "next/server";
// import yahooFinance from "yahoo-finance2";

// const acoes = ["PETR4.SA", "VALE3.SA", "ITUB4.SA"]; // Ajuste conforme necessário

// export async function GET() {
//   try {
//     const hoje = new Date();
//     const umAnoAtras = new Date();
//     umAnoAtras.setFullYear(hoje.getFullYear() - 1);

//     const resultado: Record<string, { date: string; amount: number }[]> = {};

//     for (const symbol of acoes) {
//       try {
//         const dividends = await yahooFinance.dividends(symbol, {
//           period1: umAnoAtras.toISOString(),
//           period2: hoje.toISOString(),
//         });

//         if (!dividends || !Array.isArray(dividends) || dividends.length === 0) {
//           resultado[symbol.replace(".SA", "")] = [];
//           continue;
//         }

//         resultado[symbol.replace(".SA", "")] = dividends.map((d) => ({
//           date: d.date.toISOString().split("T")[0],
//           amount: d.amount,
//         }));
//       } catch (error) {
//         // Se der erro em uma ação específica, continua com as outras
//         console.warn(`Erro ao buscar dividendos de ${symbol}:`, error);
//         resultado[symbol.replace(".SA", "")] = [];
//       }
//     }

//     return NextResponse.json(resultado);
//   } catch (error) {
//     console.error("Erro ao buscar dividendos:", error);
//     return NextResponse.json(
//       { error: "Erro ao buscar dividendos" },
//       { status: 500 }
//     );
//   }
// }
