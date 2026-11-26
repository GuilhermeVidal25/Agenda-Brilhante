"use client";
import { useState } from "react";
import { brl, resumoProf } from "@/components/Pagamento";
import { Icon } from "@/components/Icon";
import { Avatar, PageHead, corProf } from "@/components/ui";
import { useApp } from "@/lib/store";
import { durLabel } from "@/lib/util";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const shift = (mes: string, n: number) => { const [y, m] = mes.split("-").map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };

export default function Pagamentos() {
  const { db } = useApp();
  const atual = new Date().toISOString().slice(0, 7);
  const [mes, setMes] = useState(atual);
  const [copiado, setCopiado] = useState<string | null>(null);
  const linhas = db.professores.filter((p) => p.status === "ativo").map((p) => ({ p, r: resumoProf(p, db.aulas, mes) }));
  const total = linhas.reduce((s, l) => s + l.r.total, 0);
  const feitas = linhas.reduce((s, l) => s + l.r.feitas, 0);
  const previstas = linhas.reduce((s, l) => s + l.r.previstas, 0);
  const tardias = linhas.reduce((s, l) => s + l.r.tardias, 0);
  const [y, m] = mes.split("-").map(Number);
  const copiar = async (id: string, pix: string) => { try { await navigator.clipboard.writeText(pix); } catch {} setCopiado(id); setTimeout(() => setCopiado(null), 1800); };
  return (<div className="main-inner">
    <PageHead title="Pagamentos" sub="Apuração das aulas realizadas pelo valor de cada professor.">
      <div className="row" style={{ gap: 4, flexWrap: "nowrap" }} role="group" aria-label="Mês de referência">
        <button className="btn sec icon" aria-label="Mês anterior" onClick={() => setMes(shift(mes, -1))}><Icon name="left" /></button>
        <span aria-live="polite" style={{ minWidth: 170, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 600, border: "1px solid var(--line-strong)", borderRadius: 8, background: "var(--card)" }}>{MESES[m - 1]} de {y}</span>
        <button className="btn sec icon" aria-label="Próximo mês" onClick={() => setMes(shift(mes, 1))}><Icon name="right" /></button>
      </div>
    </PageHead>

    <section className="stat-cards" aria-label="Resumo do mês">
      <div className="panel big"><div className="stat hero"><span className="k">Total a pagar aos professores</span><span className="v">{brl(total)}</span><span className="s">{mes === atual ? "Parcial do mês. Soma só aulas já realizadas." : "Soma das aulas realizadas no mês."}</span></div></div>
      <div className="panel"><div className="stat"><span className="k">Aulas realizadas</span><span className="v">{feitas}</span><span className="s">{previstas} ainda previstas no mês</span></div></div>
      <div className="panel"><div className="stat"><span className="k">Cancelamentos fora do prazo</span><span className="v">{tardias}</span><span className="s">cobrados do responsável, a favor do curso</span></div></div>
    </section>

    <section className="panel" aria-label="Valores por professor" style={{ overflow: "hidden" }}>
      <div className="table-wrap"><table className="t">
        <thead><tr><th>Professor</th><th className="hide-m">Chave Pix</th><th className="num">Realizadas</th><th className="hide-m">Composição</th><th className="num hide-m">Previstas</th><th className="num">A receber</th></tr></thead>
        <tbody>{linhas.map(({ p, r }) => (<tr key={p.id}>
          <td><div className="who"><Avatar nome={p.nome} cor={corProf(db.professores, p.id)} /><div className="who-txt"><b>{p.nome}</b><span className="only-m">{p.pix || "Pix não informado"}</span></div></div></td>
          <td className="hide-m">{p.pix ? <span className="row" style={{ gap: 6, flexWrap: "nowrap", color: "var(--ink-700)" }}>{p.pix}
            <button className="btn ghost xs" aria-label={`Copiar chave Pix de ${p.nome}`} title="Copiar" onClick={() => copiar(p.id, p.pix)}><Icon name={copiado === p.id ? "check" : "copy"} size={15} style={copiado === p.id ? { color: "var(--ok)" } : undefined} /></button>
            {copiado === p.id && <span className="xs" style={{ color: "var(--ok)" }} role="status">Copiada</span>}</span>
            : <span className="chip warn">Pix não informado</span>}</td>
          <td className="num">{r.feitas}</td>
          <td className="hide-m">{r.porDur.some((x) => x.n) ? <span className="row" style={{ gap: 6 }}>{r.porDur.filter((x) => x.n).map((x) => <span key={x.d} className="chip outline">{x.n} × {durLabel(x.d)}</span>)}</span> : <span className="muted">Sem aulas</span>}</td>
          <td className="num muted hide-m">{r.previstas}</td>
          <td className="num"><b style={r.total ? undefined : { color: "var(--muted)", fontWeight: 400 }}>{brl(r.total)}</b></td>
        </tr>))}</tbody>
        <tfoot><tr><td>Total do mês</td><td className="hide-m" /><td className="num">{feitas}</td><td className="hide-m" /><td className="num hide-m">{previstas}</td><td className="num" style={{ fontSize: 16 }}>{brl(total)}</td></tr></tfoot>
      </table></div>
    </section>
    <p className="small muted row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}><Icon name="info" size={16} style={{ flex: "none", marginTop: 2 }} />Aulas canceladas fora do prazo não entram no valor do professor nesta versão (regra a confirmar).</p>
  </div>);
}
