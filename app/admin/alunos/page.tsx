"use client";
import { useState } from "react";
import { Modal } from "@/components/ui";
import { useApp } from "@/lib/store";

export default function Alunos() {
  const { db, adicionarAluno, alternarPacote } = useApp();
  const [novo, setNovo] = useState(false); const [n, setN] = useState(""); const [r, setR] = useState(""); const [e, setE] = useState("");
  return (<>
    <div className="top"><div className="grow"><h1>Alunos</h1><p className="muted">Responsáveis recebem apenas e-mails, sem login.</p></div><button className="btn" onClick={() => setNovo(true)}>+ Novo aluno</button></div>
    <div className="card"><table className="t"><thead><tr><th>Aluno</th><th>Responsável</th><th>Aulas futuras</th><th>Pacote</th><th></th></tr></thead><tbody>
      {db.alunos.map((a) => (<tr key={a.id}><td><b>{a.nome}</b></td><td>{a.responsavel}<div className="muted small">{a.emailResp}</div></td>
        <td>{db.aulas.filter((x) => x.alunoId === a.id && x.status === "agendada" && x.data >= new Date().toISOString().slice(0, 10)).length}</td>
        <td><span className={`pill ${a.pacote === "ativo" ? "ok" : "bad"}`}>{a.pacote === "ativo" ? "Ativo" : "Suspenso"}</span></td>
        <td><button className={`btn sm ${a.pacote === "ativo" ? "bad" : "sec"}`} onClick={() => alternarPacote(a.id)}>{a.pacote === "ativo" ? "Suspender pacote" : "Reativar"}</button></td></tr>))}</tbody></table>
      <p className="small muted" style={{ marginTop: 12 }}>Suspender o pacote cancela as aulas futuras do aluno. Cancelar uma aula avulsa não afeta as seguintes (faça isso pela agenda).</p></div>
    {novo && <Modal onClose={() => setNovo(false)}><h2>Novo aluno</h2>
      <label className="f">Nome do aluno<input className="in" value={n} onChange={(x) => setN(x.target.value)} /></label>
      <label className="f">Responsável<input className="in" value={r} onChange={(x) => setR(x.target.value)} /></label>
      <label className="f">E-mail do responsável<input className="in" type="email" value={e} onChange={(x) => setE(x.target.value)} /></label>
      <div className="row" style={{ justifyContent: "flex-end" }}><button className="btn ghost" onClick={() => setNovo(false)}>Cancelar</button><button className="btn" disabled={!n || !r || !e} onClick={() => { adicionarAluno(n, r, e); setNovo(false); }}>Salvar</button></div></Modal>}
  </>);
}
