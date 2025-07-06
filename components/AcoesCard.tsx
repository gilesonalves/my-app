"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SetStateAction, useEffect, useState } from "react";
import axios from "axios";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Sparklines, SparklinesLine } from "react-sparklines";

import { useCallback } from "react";
type Acao = {
    symbol: string;
    longName: string;
    regularMarketPrice: number;
    currency: string;
    regularMarketPreviousClose: number;
    sparkline?: number[]; // valores simulados para o mini gráfico
};

export default function AcoesCard() {
    const [acoes, setAcoes] = useState<Acao[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("");
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState("");



    const fetchAcoes = useCallback(async () => {
        try {
            const res = await axios.get("/api/acoes");
            const dados = res.data.map((acao: Acao) => ({
                ...acao,
                sparkline: gerarSparkline(acao.regularMarketPreviousClose, acao.regularMarketPrice),
            }));
            setAcoes(dados);
            const agora = new Date();
            setUltimaAtualizacao(
                agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
            );
        } catch (error) {
            console.error("Erro ao buscar ação:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const gerarSparkline = (start: number, end: number): number[] => {
        const steps = 10;
        const values = [];
        for (let i = 0; i < steps; i++) {
            values.push(start + ((end - start) * i) / steps + Math.random() * 0.5);
        }
        values.push(end);
        return values;
    };

    useEffect(() => {
        fetchAcoes();
        const interval = setInterval(fetchAcoes, 120000);
        return () => clearInterval(interval);
    }, [fetchAcoes]);

    const acoesFiltradas = acoes.filter((acao) =>
        `${acao.longName} ${acao.symbol}`.toLowerCase().includes(filtro.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-600 dark:text-gray-300">
                <p className="animate-pulse">Carregando cotações...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <input
                    placeholder="Filtrar por nome ou código da ação"
                    value={filtro}
                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setFiltro(e.target.value)}
                    className="w-full md:w-80"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Última atualização: {ultimaAtualizacao}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {acoesFiltradas.map((acao) => {
                    const precoAtual = acao.regularMarketPrice;
                    const precoAnterior = acao.regularMarketPreviousClose;
                    const variacao = precoAtual - precoAnterior;
                    const variacaoPercentual = ((variacao / precoAnterior) * 100).toFixed(2);

                    let cor = "text-gray-600 dark:text-gray-300";
                    let Icone = Minus;

                    if (variacao > 0) {
                        cor = "text-green-600";
                        Icone = ArrowUpRight;
                    } else if (variacao < 0) {
                        cor = "text-red-600";
                        Icone = ArrowDownRight;
                    }

                    return (
                        <Card key={acao.symbol} className="rounded-2xl shadow-md">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold dark:text-white">{acao.longName}</h2>
                                    <span className={`ml-2 ${cor}`}>
                                        <Icone className="w-5 h-5" />
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{acao.symbol}</p>
                                <p className={`text-xl font-semibold mt-2 ${cor}`}>
                                    {acao.currency} {precoAtual.toFixed(2)}
                                </p>
                                <p className={`text-sm mt-1 ${cor}`}>
                                    {variacao > 0 ? "+" : ""}
                                    {variacao.toFixed(2)} ({variacaoPercentual}%)
                                </p>

                                {acao.sparkline && (
                                    <div className="mt-3">
                                        <Sparklines data={acao.sparkline} limit={15} height={30}>
                                            <SparklinesLine color={cor.includes("green") ? "green" : cor.includes("red") ? "red" : "gray"} />
                                        </Sparklines>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
