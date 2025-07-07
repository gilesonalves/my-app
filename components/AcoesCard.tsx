"use client";

import { useEffect, useState } from "react";

type Acao = {
  symbol: string;
  description: string;
  currentPrice: number;
  previousClose: number;
  currency: string;
};

type CotasSalvas = {
  [symbol: string]: number;
};

type ResumoInvestimentoProps = {
  totalInvestido: number;
  valorAtual: number;
};

function ResumoInvestimento({ totalInvestido, valorAtual }: ResumoInvestimentoProps) {
  const ganho = valorAtual - totalInvestido;
  const ganhoPositivo = ganho >= 0;

  return (
    <section className="p-4 border rounded bg-white shadow-md max-w-md mx-auto my-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Resumo do Investimento</h2>
      <p className="text-lg mb-2">
        <strong>Total Investido:</strong> R$ {totalInvestido.toFixed(2)}
      </p>
      <p className="text-lg mb-2">
        <strong>Valor Atual do Portfólio:</strong> R$ {valorAtual.toFixed(2)}
      </p>
      <p className={ganhoPositivo ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
        <strong>Ganho / Perda:</strong> R$ {ganho.toFixed(2)}
      </p>
    </section>
  );
}

export default function AcoesCard() {
  const [acoes, setAcoes] = useState<Acao[]>([]);
  const [cotas, setCotas] = useState<CotasSalvas>({});
  const [carregado, setCarregado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const cotasSalvas = localStorage.getItem("cotas");
    if (cotasSalvas) {
      setCotas(JSON.parse(cotasSalvas));
    }
    setCarregado(true);
  }, []);

  async function fetchAcoes() {
    try {
      setCarregando(true);
      const res = await fetch("/api/acoes");
      if (!res.ok) throw new Error("Erro ao buscar ações");
      const data: Acao[] = await res.json();
      setAcoes(data);
      setErro(null);
    } catch (error) {
      setErro("Erro ao buscar ações");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  function handleCotaChange(symbol: string, valor: string) {
    const quantidade = parseFloat(valor);
    const novasCotas = {
      ...cotas,
      [symbol]: isNaN(quantidade) ? 0 : quantidade,
    };
    setCotas(novasCotas);
    localStorage.setItem("cotas", JSON.stringify(novasCotas));
  }

  function limparCota(symbol: string) {
    const novasCotas = { ...cotas };
    delete novasCotas[symbol];
    setCotas(novasCotas);
    localStorage.setItem("cotas", JSON.stringify(novasCotas));
  }

  if (!carregado) return null;
  if (carregando) return <p>Carregando ações...</p>;
  if (erro) return <p className="text-red-600">{erro}</p>;

  // Calcular totais para o resumo
  const totalInvestido = Object.entries(cotas).reduce((acc, [symbol, qtd]) => {
    const acao = acoes.find((a) => a.symbol === symbol);
    if (!acao) return acc;
    return acc + qtd * acao.previousClose;
  }, 0);

  const valorAtual = Object.entries(cotas).reduce((acc, [symbol, qtd]) => {
    const acao = acoes.find((a) => a.symbol === symbol);
    if (!acao) return acc;
    return acc + qtd * acao.currentPrice;
  }, 0);

  return (
    <div className="p-4">
      <button
        onClick={fetchAcoes}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Atualizar Ações
      </button>

      <ResumoInvestimento totalInvestido={totalInvestido} valorAtual={valorAtual} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {acoes.map((acao) => {
          const cota = cotas[acao.symbol] || 0;
          const total = cota * acao.currentPrice;
          const variacao = acao.currentPrice - acao.previousClose;
          const ganhoPerda = cota * variacao;

          return (
            <div key={acao.symbol} className="bg-white shadow-md rounded-xl p-4">
              <h2 className="text-lg font-semibold">{acao.description}</h2>
              <p className="text-gray-500">{acao.symbol}</p>
              <p className="text-blue-600 font-bold">
                {acao.currency === "BRL" ? "R$" : acao.currency} {acao.currentPrice.toFixed(2)}
              </p>

              <div className="mt-2">
                <label className="text-sm">Quantidade de cotas:</label>
                <input
                  type="number"
                  min={0}
                  value={cota}
                  onChange={(e) => handleCotaChange(acao.symbol, e.target.value)}
                  className="w-full mt-1 p-2 border rounded"
                />
                <button
                  onClick={() => limparCota(acao.symbol)}
                  className="text-red-500 text-sm mt-1 hover:underline"
                >
                  Limpar cota
                </button>
              </div>

              <div className="mt-2 text-sm">
                <p>
                  Valor total:{" "}
                  <strong>
                    {acao.currency === "BRL" ? "R$" : acao.currency} {total.toFixed(2)}
                  </strong>
                </p>
                <p>
                  Ganho/Perda:{" "}
                  <strong className={ganhoPerda >= 0 ? "text-green-600" : "text-red-600"}>
                    {acao.currency === "BRL" ? "R$" : acao.currency} {ganhoPerda.toFixed(2)}
                  </strong>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
