"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Price = {
  date: string;
  close: number;
};

export default function HistoricoChart() {
  const [symbol, setSymbol] = useState("PETR4.SA");
  const [period, setPeriod] = useState("30d");
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchHistorico() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/historico?symbol=${symbol}&period=${period}`);
      if (!res.ok) throw new Error("Erro ao buscar histórico");
      const data = await res.json();
      setPrices(data.prices);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistorico();
  }, [symbol, period]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Histórico de Preços</h2>

      <div className="flex gap-4 mb-4">
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="border rounded p-2"
        >
          <option value="PETR4.SA">PETR4</option>
          <option value="TAEE4.SA">TAEE4</option>
          <option value="ITSA4.SA">ITSA4</option>
          <option value="BBAS3.SA">BBAS3</option>
          <option value="MXRF11.SA">MXRF11 (FII)</option>
          <option value="HGLG11.SA">HGLG11 (FII)</option>
        </select>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border rounded p-2"
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="3mo">Últimos 3 meses</option>
          <option value="6mo">Últimos 6 meses</option>
          <option value="1y">Último ano</option>
        </select>
      </div>

      {loading && <p>Carregando dados...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && prices.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={prices}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {!loading && !error && prices.length === 0 && (
        <p>Nenhum dado disponível para o período selecionado.</p>
      )}
    </div>
  );
}
