"use client";
import { useEffect, useState } from "react";

type Dica = {
  ticker: string;
  desempenho: string;
  dividendos: string;
  recomendacao: string;
};

type DicasResponse = {
  acoes: Dica[];
  fiis: Dica[];
  totalDividendos: string;
};

export default function DicasInvestimento() {
  const [dicas, setDicas] = useState<DicasResponse | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchDicas() {
      try {
        const res = await fetch("/api/dicas");
        const data = await res.json();

        // Verifica se o formato está certo
        if (data?.acoes && data?.fiis && data?.totalDividendos) {
          setDicas(data);
        } else {
          console.error("Formato inesperado:", data);
          setDicas(null);
        }
      } catch (error) {
        console.error("Erro ao buscar dicas:", error);
        setDicas(null);
      } finally {
        setCarregando(false);
      }
    }

    fetchDicas();
  }, []);

  if (carregando) return <p>Carregando dicas de investimento...</p>;
  if (!dicas) return <p>Erro ao carregar dados.</p>;

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-2">📈 Ações</h3>
      {dicas.acoes?.map((dica) => (
        <div key={dica.ticker} className="mb-3">
          <strong>{dica.ticker}</strong> — {dica.desempenho}% <br />
          <span className="text-sm">{dica.recomendacao}</span>
        </div>
      ))}

      <h3 className="text-lg font-semibold mt-4 mb-2">🏢 FIIs</h3>
      {dicas.fiis?.map((dica) => (
        <div key={dica.ticker} className="mb-3">
          <strong>{dica.ticker}</strong> — {dica.desempenho}% <br />
          <span className="text-sm">{dica.recomendacao}</span>
        </div>
      ))}

      <div className="mt-4 text-sm text-gray-600">
        💰 Total de dividendos recebidos no mês:{" "}
        <strong>R$ {dicas.totalDividendos}</strong>
      </div>
    </div>
  );
}
