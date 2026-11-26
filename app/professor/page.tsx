"use client";
import Link from "next/link";
import { brl, detalhe, resumoProf } from "@/components/Pagamento";
import { Kpi, StatusPill } from "@/components/ui";
import { useProf } from "@/lib/useProf";
import { durLabel, fimAula, fmtData, inicioAula } from "@/lib/util";

export default function Inicio() {
  const { db, prof } = useProf();
  if (!prof) return null;
  const mes = new Date().toISOString().slice(0, 7);
  const r = resumoProf(prof, db.aulas, mes);
  const minhas = db.aulas.filter((a) => a.profId === prof.id);
  const prox = minhas.filter((a) => a.status === "agendada" && +inicioAula(a) + a.duracao * 60000 >= Date.now()).sort((a, b) => +inicioAula(a) - +inicioAula(b)).slice(0, 5);
  const semRel = minhas.filter((a) => a.status === "agendada" && +inicioAula(a) + a.duracao * 60000 < Date.now());
  return (<>
    <div className="top"><div className="grow"><h1>Olá, {prof.nome.split(" ")[0]} 👋</h1><p className="muted">Seu resumo de {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}.</p></div></div>
    <div className="grid g3" style={{ marginBottom: 16 }}>
      <Kpi t="Aulas dadas no mês" v={r.feitas} sub={detalhe(r)} /><Kpi t="Você recebe (aulas realizadas)" v={brl(r.total)} /><Kpi t="Aulas previstas" v={r.previstas} />
    </div>
    {semRel.length > 0 && <div className="alert warn">📝 Você tem {semRel.length} aula(s) já concluída(s) sem relatório. <Link href="/professor/aulas" style={{ fontWeight: 700, textDecoration: "underline" }}>Enviar agora</Link></div>}
    {!prof.pix && <div className="alert warn">💳 Informe sua chave Pix para receber. <Link href="/professor/perfil" style={{ fontWeight: 700, textDecoration: "underline" }}>Completar perfil</Link></div>}
    <div className="card"><h2>Próximas aulas</h2>{prox.length === 0 && <p className="muted">Sem aulas agendadas.</p>}
      <table className="t keep"><tbody>{prox.map((a) => (<tr key={a.id}><td className="nowrap"><b>{fmtData(a.data)}</b><div className="muted small">{a.hora} às {fimAula(a)} · {durLabel(a.duracao)}</div></td>
        <td>{a.materia}<div className="muted small">{db.alunos.find((x) => x.id === a.alunoId)?.nome}</div></td><td><StatusPill s={a.status} /></td></tr>))}</tbody></table></div>
  </>);
}
