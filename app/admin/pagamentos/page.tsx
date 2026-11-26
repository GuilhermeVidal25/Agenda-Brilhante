"use client";
import { useState } from "react";
import { brl, detalhe, resumoProf } from "@/components/Pagamento";
import { Kpi } from "@/components/ui";
import { useApp } from "@/lib/store";

export default function Pagamentos() {
  const { db } = useApp();
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const linhas = db.professores.filter((p) => p.status === "ativo").map((p) => ({ p, r: resumoProf(p, db.aulas, mes) }));
  const total = linhas.reduce((s, l) => s + l.r.total, 0);
  return (<>
    <div className="top"><div className="grow"><h1>Pagamentos</h1><p className="muted">Apuração por aulas realizadas, com o valor de cada professor.</p></div>
      <input className="in" style={{ width: 180 }} type="month" value={mes} onChange={(e) => setMes(e.target.value)} /></div>
    <div className="grid g3" style={{ marginBottom: 16 }}>
      <Kpi t="Total a pagar aos professores" v={brl(total)} /><Kpi t="Aulas realizadas" v={linhas.reduce((s, l) => s + l.r.feitas, 0)} />
      <Kpi t="Cancelamentos fora do prazo" v={linhas.reduce((s, l) => s + l.r.tardias, 0)} sub="cobrados do responsável, em favor do curso" /></div>
    <div className="card"><table className="t keep"><thead><tr><th>Professor</th><th>Realizadas</th><th>Detalhe</th><th>Previstas</th><th>A receber</th></tr></thead><tbody>
      {linhas.map(({ p, r }) => (<tr key={p.id}><td><b>{p.nome}</b><div className="muted small">Pix: {p.pix || "não informado"}</div></td><td>{r.feitas}</td><td className="small">{detalhe(r)}</td><td>{r.previstas}</td><td><b>{brl(r.total)}</b></td></tr>))}</tbody></table>
      <p className="small muted" style={{ marginTop: 12 }}>Aulas canceladas fora do prazo não entram no valor do professor nesta versão (regra a confirmar).</p></div>
  </>);
}
