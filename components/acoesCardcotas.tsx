"use client";
import { useEffect, useState } from "react";
import axios from "axios";

type Acao = {
  symbol: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketPreviousClose: number;
  currency: string;
  source: string;
};

export default function AcoesCard() {
  const [acoes, setAcoes] = useState<Acao[]>([]);
  const [cotas, setCotas] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchAcoes = async () => {
      try {
        const res = await axios.get("/api/acoes");
        setAcoes(res.data);
      } catch (error) {
        console.error("Erro ao buscar ação:", error);
      }
    };

    const cotasSalvas = localStorage.getItem("cotas");
    if (cotasSalvas) {
      setCotas(JSON.parse(cotasSalvas));
    }

    fetchAcoes();
  }, []);

  const handleInputChange = (symbol: string, value: string) => {
    const quantidade = parseFloat(value);
    const novasCotas = { ...cotas, [symbol]: isNaN(quantidade) ? 0 : quantidade };
    setCotas(novasCotas);
    localStorage.setItem("cotas", JSON.stringify(novasCotas));
  };

  const limparCota = (symbol: string) => {
    const novasCotas = { ...cotas, [symbol]: 0 };
    setCotas(novasCotas);
    localStorage.setItem("cotas", JSON.stringify(novasCotas));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {acoes.map((acao) => {
        const quantidade = cotas[acao.symbol] || 0;
        const totalInvestido = quantidade * acao.regularMarketPreviousClose;
        const totalAtual = quantidade * acao.regularMarketPrice;
        const variacao = totalAtual - totalInvestido;

        return (
          <div key={acao.symbol} className="border rounded-xl p-4 shadow-md">
            <h2 className="text-lg font-semibold">{acao.longName} ({acao.symbol})</h2>
            <p>Preço atual: {acao.currency} {acao.regularMarketPrice.toFixed(2)}</p>
            <p>Preço anterior: {acao.currency} {acao.regularMarketPreviousClose.toFixed(2)}</p>

            <div className="mt-2">
              <label className="text-sm">Quantidade de cotas:</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-24 ml-2"
                value={quantidade}
                onChange={(e) => handleInputChange(acao.symbol, e.target.value)}
              />
              <button
                onClick={() => limparCota(acao.symbol)}
                className="ml-4 text-orange-600 text-sm hover:underline"
              >
                Limpar cota
              </button>
            </div>

            <div className="mt-2 text-sm">
              <p>Investido: {acao.currency} {totalInvestido.toFixed(2)}</p>
              <p>Valor atual: {acao.currency} {totalAtual.toFixed(2)}</p>
              <p className={variacao >= 0 ? "text-green-600" : "text-red-600"}>
                {variacao >= 0 ? "Lucro" : "Prejuízo"}: {acao.currency} {variacao.toFixed(2)}
              </p>
            </div>

            <p className="mt-2 text-xs text-gray-500">Fonte: {acao.source}</p>
          </div>
        );
      })}
    </div>
  );
}
