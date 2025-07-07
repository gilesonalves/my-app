import React from "react";
import AcoesCard from "@/components/AcoesCard";
import DicasInvestimento from "@/components/DicasInvestimento";
import HistoricoChart from "@/components/HistoricoChart";




export default function Home() {
  return (
    <div className="grid grid-cols-1  gap-4 p-4">
      <div className="p-4">
        <AcoesCard />
        <DicasInvestimento />
        <HistoricoChart />
      </div>
    </div>
  );
}
