"use client";
import { useState } from "react";
import { Modal, StatusPill } from "@/components/ui";
import { useProf } from "@/lib/useProf";
import { brl, durLabel, fimAula, fmtData, inicioAula, valorAula } from "@/lib/util";

export default function Aulas() {
  const { db, prof, enviarRelatorio } = useProf();
  const [id, setId] = useState<string | null>(null); const [c, setC] = useState(""); const [at, setAt] = useState("");
  if (!prof) return null;
  const minhas = db.aulas.filter((a) => a.profId === prof.id).sort((a, b) => +inicioAula(b) - +inicioAula(a));
  const alvo = minhas.find((a) => a.id === id);
  const podeRel = (a: typeof minhas[number]) => a.status === "agendada" && +inicioAula(a) + a.duracao * 60000 < Date.now();
  return (<>
    <div className="top"><div className="grow"><h1>Minhas aulas</h1><p className="muted">Quem agenda, cancela ou reagenda é a administração. Você registra a aula dada enviando o relatório.</p></div></div>
    <div className="card"><div className="scroll"><table className="t keep"><thead><tr><th>Data</th><th>Aula</th><th className="hide-m">Valor</th><th>Status</th></tr></thead><tbody>
      {minhas.map((a) => (<tr key={a.id}><td className="nowrap"><b>{fmtData(a.data)}</b><div className="muted small">{a.hora} às {fimAula(a)} · {durLabel(a.duracao)}</div></td>
        <td>{a.materia}<div className="muted small">{db.alunos.find((x) => x.id === a.alunoId)?.nome}</div></td><td className="hide-m">{brl(valorAula(prof, a))}</td>
        <td><StatusPill s={a.status} />{a.relatorio && <div className="muted small">Relatório enviado</div>}
          {podeRel(a) && <div style={{ marginTop: 6 }}><button className="btn sm" onClick={() => { setId(a.id); setC(""); setAt(""); }}>Enviar relatório</button></div>}</td></tr>))}</tbody></table></div></div>
    {alvo && <Modal onClose={() => setId(null)}><h2>Relatório da aula</h2><p className="muted small">{alvo.materia} · {fmtData(alvo.data)} · {db.alunos.find((x) => x.id === alvo.alunoId)?.nome}. O relatório será enviado à administração e ao responsável.</p>
      <label className="f">O que foi trabalhado na aula<textarea className="in" rows={4} value={c} onChange={(e) => setC(e.target.value)} placeholder="Ex.: Equações do 2º grau e resolução de problemas." /></label>
      <label className="f">Atividade deixada para o aluno (opcional)<textarea className="in" rows={2} value={at} onChange={(e) => setAt(e.target.value)} /></label>
      <div className="row" style={{ justifyContent: "flex-end" }}><button className="btn ghost" onClick={() => setId(null)}>Cancelar</button><button className="btn" disabled={c.trim().length < 5} onClick={() => { enviarRelatorio(alvo.id, { conteudo: c.trim(), atividade: at.trim() }); setId(null); }}>Enviar relatório</button></div></Modal>}
  </>);
}
