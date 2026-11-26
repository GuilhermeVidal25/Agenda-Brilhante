"use client";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Empty, Modal, ModalHead, PageHead } from "@/components/ui";
import { useApp } from "@/lib/store";

export default function Alunos() {
  const { db, adicionarAluno, alternarPacote } = useApp();
  const [novo, setNovo] = useState(false); const [n, setN] = useState(""); const [r, setR] = useState(""); const [e, setE] = useState("");
  const hoje = new Date().toISOString().slice(0, 10);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const fechar = () => { setNovo(false); setN(""); setR(""); setE(""); };
  return (<div className="main-inner">
    <PageHead title="Alunos" sub="Responsáveis recebem apenas e-mails, sem login.">
      <button className="btn" onClick={() => setNovo(true)}><Icon name="plus" stroke={2} />Novo aluno</button>
    </PageHead>
    <section className="panel" aria-label="Lista de alunos" style={{ overflow: "hidden" }}>
      {db.alunos.length === 0 ? <Empty icon="users" title="Nenhum aluno cadastrado" action={<button className="btn sec" onClick={() => setNovo(true)}>Cadastrar aluno</button>}>Cadastre o aluno e o e-mail do responsável para agendar aulas.</Empty> : (
      <div className="table-wrap"><table className="t">
        <thead><tr><th>Aluno</th><th className="hide-m">Responsável</th><th className="num hide-m">Aulas futuras</th><th>Pacote</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>{db.alunos.map((a) => (<tr key={a.id}>
          <td><div className="who-txt" style={{ display: "flex", flexDirection: "column" }}><b>{a.nome}</b><span className="small muted only-m">{a.responsavel}</span></div></td>
          <td className="hide-m"><div style={{ display: "flex", flexDirection: "column" }}>{a.responsavel}<span className="small muted">{a.emailResp}</span></div></td>
          <td className="num hide-m">{db.aulas.filter((x) => x.alunoId === a.id && x.status === "agendada" && x.data >= hoje).length}</td>
          <td><span className={`chip ${a.pacote === "ativo" ? "ok" : "gray"}`}>{a.pacote === "ativo" ? "Ativo" : "Suspenso"}</span></td>
          <td className="num"><button className={`btn sm ${a.pacote === "ativo" ? "danger" : "sec"}`} onClick={() => alternarPacote(a.id)}>{a.pacote === "ativo" ? "Suspender pacote" : "Reativar"}</button></td>
        </tr>))}</tbody>
      </table></div>)}
      <div className="panel-foot small muted row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}><Icon name="info" size={16} style={{ flex: "none", marginTop: 1 }} />Suspender o pacote cancela as aulas futuras do aluno. Cancelar uma aula avulsa não afeta as seguintes (faça isso pela agenda).</div>
    </section>
    {novo && (
      <Modal onClose={fechar} narrow label="Novo aluno">
        <ModalHead title="Novo aluno" sub="O responsável recebe confirmações e relatórios por e-mail." onClose={fechar} />
        <div className="m-body">
          <label className="field"><span className="label">Nome do aluno</span><input className="in" value={n} onChange={(x) => setN(x.target.value)} /></label>
          <label className="field"><span className="label">Responsável</span><input className="in" value={r} onChange={(x) => setR(x.target.value)} /></label>
          <label className="field"><span className="label">E-mail do responsável</span><input className={`in ${e && !emailOk ? "err" : ""}`} type="email" value={e} onChange={(x) => setE(x.target.value)} aria-invalid={!!e && !emailOk} />
            {e && !emailOk && <span className="hint err">Confira o e-mail: falta algo como nome@dominio.com.</span>}</label>
        </div>
        <div className="m-foot"><span className="grow hide-m" /><button className="btn ghost" onClick={fechar}>Cancelar</button><button className="btn" disabled={!n || !r || !emailOk} onClick={() => { adicionarAluno(n, r, e); fechar(); }}>Salvar aluno</button></div>
      </Modal>)}
  </div>);
}
