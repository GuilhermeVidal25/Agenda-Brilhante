"use client";
import Link from "next/link";
import { useState } from "react";
import { DetalheAula } from "@/components/AulaModais";
import { Kpi, StatusPill } from "@/components/ui";
import { useApp } from "@/lib/store";
import { addDays, fimAula, fmtData, inicioAula, iso, startOfWeek } from "@/lib/util";

export default function Inicio() {
  const { db } = useApp();
  const [sel, setSel] = useState<string | null>(null);
  const ini = startOfWeek(new Date()); const fim = addDays(ini, 6);
  const semana = db.aulas.filter((a) => a.data >= iso(ini) && a.data <= iso(fim));
  const aConferir = db.aulas.filter((a) => a.relatorio && !a.relatorio.verificado);
  const pend = db.professores.filter((p) => p.status === "pendente");
  const prox = db.aulas.filter((a) => a.status === "agendada" && inicioAula(a) >= new Date()).sort((a, b) => +inicioAula(a) - +inicioAula(b)).slice(0, 6);
  return (<>
    <div className="top"><div className="grow"><h1>Olá, Guilherme 👋</h1><p className="muted">Resumo da semana de {fmtData(iso(ini))} a {fmtData(iso(fim))}.</p></div>
      <Link href="/admin/agenda" className="btn">Abrir agenda</Link></div>
    <div className="grid g4" style={{ marginBottom: 16 }}>
      <Kpi t="Aulas na semana" v={semana.filter((a) => a.status !== "cancelada" && a.status !== "cancelada_tardia").length} />
      <Kpi t="Realizadas" v={semana.filter((a) => a.status === "realizada").length} />
      <Kpi t="Canceladas" v={semana.filter((a) => a.status.startsWith("cancelada")).length} sub={`${semana.filter((a) => a.status === "cancelada_tardia").length} fora do prazo de 4h`} />
      <Kpi t="Relatórios a conferir" v={aConferir.length} />
    </div>
    <div className="grid g2">
      <div className="card"><h2>Próximas aulas</h2>
        {prox.length === 0 && <p className="muted">Nenhuma aula futura agendada.</p>}
        <table className="t keep"><tbody>{prox.map((a) => (<tr key={a.id} style={{ cursor: "pointer" }} onClick={() => setSel(a.id)}>
          <td className="nowrap"><b>{fmtData(a.data)}</b><div className="muted small">{a.hora} às {fimAula(a)}</div></td>
          <td>{a.materia}<div className="muted small">{db.professores.find((p) => p.id === a.profId)?.nome} · {db.alunos.find((x) => x.id === a.alunoId)?.nome}</div></td>
          <td><StatusPill s={a.status} /></td></tr>))}</tbody></table></div>
      <div className="grid" style={{ alignContent: "start" }}>
        <div className="card"><h2>Pendências</h2>
          {pend.length === 0 && aConferir.length === 0 && <p className="muted">Tudo em dia. ✅</p>}
          {pend.map((p) => <div key={p.id} className="row" style={{ marginBottom: 8 }}><span className="grow">🎓 <b>{p.nome}</b> aguarda aprovação de cadastro</span><Link className="btn sm" href="/admin/professores">Revisar</Link></div>)}
          {aConferir.map((a) => <div key={a.id} className="row" style={{ marginBottom: 8 }}><span className="grow">📝 Relatório de <b>{db.professores.find((p) => p.id === a.profId)?.nome}</b> ({fmtData(a.data)})</span><button className="btn sm sec" onClick={() => setSel(a.id)}>Conferir</button></div>)}
        </div>
        <div className="card"><h2>Regras ativas</h2>
          <p className="small muted">• Só a administração cria, cancela, reagenda e registra aulas.</p>
          <p className="small muted">• Cancelamento do responsável até 4h antes. Fora do prazo, a aula é cobrada ao curso.</p>
          <p className="small muted" style={{ margin: 0 }}>• Professor só entra após aprovação e e-mail de liberação.</p></div>
      </div>
    </div>
    {sel && <DetalheAula id={sel} admin onClose={() => setSel(null)} />}
  </>);
}
