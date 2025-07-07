"use client";

import { useEffect, useState } from "react";

type Dividendo = {
    date: string;
    amount: number;
};

type DividendosPorAcao = {
    [symbol: string]: Dividendo[];
}

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

type DicaOnline = {
    symbol: string;
    tip: string;
};

function calcularSMA(prices: number[], period: number): number | null {
    if (prices.length < period) return null;
    const subset = prices.slice(prices.length - period);
    const soma = subset.reduce((acc, val) => acc + val, 0);
    return soma / period;
}

function DicasAporte({
    acoes,
}: {
    acoes: Acao[];
}) {
    const [dicasOnline, setDicasOnline] = useState<DicaOnline[]>([]);
    const [loadingDicas, setLoadingDicas] = useState(false);

    const gerarHistorico = (acao: Acao): number[] => {
        const history: number[] = [];
        for (let i = 10; i >= 1; i--) {
            history.push(acao.currentPrice - Math.random() * i * 0.5);
        }
        return history;
    };

    useEffect(() => {
        async function fetchDicas() {
            setLoadingDicas(true);
            try {
                const res = await fetch("https://api.exemplo.com/dicas-investimento");
                if (!res.ok) throw new Error("Erro ao buscar dicas online");
                const data: DicaOnline[] = await res.json();
                setDicasOnline(data);
            } catch {
                setDicasOnline([]);
            } finally {
                setLoadingDicas(false);
            }
        }
        fetchDicas();
    }, []);

    const acoesComSMA = acoes.map((acao) => {
        const historico = gerarHistorico(acao);
        const sma5 = calcularSMA(historico, 5);
        const abaixoSMA = sma5 !== null ? acao.currentPrice < sma5 : false;
        return {
            symbol: acao.symbol,
            description: acao.description,
            currentPrice: acao.currentPrice,
            sma5,
            abaixoSMA,
        };
    });

    const sugestoesPorSMA = acoesComSMA.filter((a) => a.abaixoSMA);

    return (
        <section className="p-4 border rounded bg-white shadow-md max-w-3xl mx-auto mb-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Dicas de Aporte com SMA e Dicas Online</h2>

            <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Ativos abaixo da Média Móvel Simples (SMA 5):</h3>
                {sugestoesPorSMA.length === 0 && <p>Nenhum ativo abaixo da SMA 5 no momento.</p>}
                <ul className="list-disc list-inside">
                    {sugestoesPorSMA.map((a) => (
                        <li key={a.symbol}>
                            <strong>{a.symbol}</strong> ({a.description}) está abaixo da SMA5 {a.sma5?.toFixed(2)}, preço atual: {a.currentPrice.toFixed(2)} — possível oportunidade de compra.
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-2">Dicas Online:</h3>
                {loadingDicas && <p>Carregando dicas online...</p>}
                {!loadingDicas && dicasOnline.length === 0 && (
                    <p>Nenhuma dica online disponível no momento.</p>
                )}
                {!loadingDicas && dicasOnline.length > 0 && (
                    <ul className="list-disc list-inside">
                        {dicasOnline.map((dica) => (
                            <li key={dica.symbol}>
                                <strong>{dica.symbol}</strong>: {dica.tip}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

export default function AcoesCardComDicasOnline() {
    const [acoes, setAcoes] = useState<Acao[]>([]);
    const [cotas, setCotas] = useState<CotasSalvas>({});
    const [carregado, setCarregado] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [dividendos, setDividendos] = useState<DividendosPorAcao>({});

    useEffect(() => {
        async function fetchDividendos() {
            try {
                const res = await fetch("/api/dividendos");
                if (!res.ok) throw new Error("Erro ao buscar dividendos");
                const data: DividendosPorAcao = await res.json();
                setDividendos(data);
            } catch (e) {
                console.error("Erro ao buscar dividendos", e);
            }
        }

        fetchDividendos();
    }, []);

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

    return (
        <div className="p-4">
            <button
                onClick={fetchAcoes}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Atualizar Ações
            </button>

            <DicasAporte acoes={acoes} />

            {acoes.map((acao) => {
                const cota = cotas[acao.symbol] || 0;
                const total = cota * acao.currentPrice;
                const variacao = acao.currentPrice - acao.previousClose;
                const ganhoPerda = cota * variacao;

                return (
                    <div key={acao.symbol} className="bg-white shadow-md rounded-xl p-4 mt-4">
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
                                Valor total: <strong>{acao.currency === "BRL" ? "R$" : acao.currency} {total.toFixed(2)}</strong>
                            </p>
                            <p>
                                Ganho/Perda: <strong className={ganhoPerda >= 0 ? "text-green-600" : "text-red-600"}>
                                    {acao.currency === "BRL" ? "R$" : acao.currency} {ganhoPerda.toFixed(2)}
                                </strong>
                            </p>
                        </div>

                        <div className="mt-2 text-sm">
                            <h4 className="font-semibold mt-4">Últimos Dividendos:</h4>
                            {dividendos[acao.symbol]?.length ? (
                                <ul className="list-disc list-inside">
                                    {dividendos[acao.symbol].slice(0, 3).map((div, i) => (
                                        <li key={i}>
                                            {new Date(div.date).toLocaleDateString("pt-BR")} — R$ {div.amount.toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">Nenhum dividendo recente.</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
