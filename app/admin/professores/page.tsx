"use client";
import { useState } from "react";
import { Modal } from "@/components/ui";
import { useApp } from "@/lib/store";
import { DIAS, DURACOES, brl, durLabel } from "@/lib/util";
import type { Professor } from "@/lib/types";

export default function Professores() {
  const { db, aprovarProf, atualizarProf } = useApp();
  const [ed, setEd] = useState<Professor | null>(null);
  const pend = db.professores.filter((p) => p.status === "pendente");
  return (<>
    <div className="top"><div className="grow"><h1>Professores</h1><p className="muted">{db.professores.filter((p) => p.status === "ativo").length} ativos · {pend.length} aguardando aprovação</p></div></div>
    {pend.length > 0 && <div className="card" style={{ marginBottom: 16, borderColor: "var(--warn)" }}><h2>Cadastros para aprovar</h2>
      {pend.map((p) => <div key={p.id} className="row" style={{ marginBottom: 8 }}><span className="grow"><b>{p.nome}</b> · {p.email} · {p.materias.join(", ")}</span>
        <button className="btn" onClick={() => aprovarProf(p.id)}>Aprovar e avisar por e-mail</button></div>)}</div>}
    <div className="card"><table className="t"><thead><tr><th>Professor</th><th>Matérias</th><th>Valores por aula</th><th>Pix</th><th></th></tr></thead><tbody>
      {db.professores.filter((p) => p.status !== "pendente").map((p) => (<tr key={p.id}>
        <td><b>{p.nome}</b><div className="muted small">{p.email}</div></td><td>{p.materias.join(", ")}</td>
        <td className="small">{DURACOES.map((d) => `${durLabel(d)}: ${brl(p.valores[d])}`).join(" · ")}</td>
        <td className="small">{p.pix || <span className="pill warn">Não informado</span>}</td>
        <td><button className="btn sm sec" onClick={() => setEd(p)}>Editar valores</button></td></tr>))}</tbody></table></div>
    {ed && <Modal onClose={() => setEd(null)}><h2>Valores de {ed.nome}</h2><p className="muted small">Valor pago ao professor por duração de aula.</p>
      {DURACOES.map((d) => <label key={d} className="f">{durLabel(d)}<input className="in" type="number" step="0.5" value={ed.valores[d]} onChange={(e) => setEd({ ...ed, valores: { ...ed.valores, [d]: Number(e.target.value) } })} /></label>)}
      <p className="small muted">Disponibilidade informada: {ed.disp.length ? `${new Set(ed.disp.map((x) => x.split("-")[0])).size} dias na semana (${[...new Set(ed.disp.map((x) => DIAS[Number(x.split("-")[0])]))].join(", ")})` : "ainda não informada"}.</p>
      <div className="row" style={{ justifyContent: "flex-end" }}><button className="btn ghost" onClick={() => setEd(null)}>Cancelar</button><button className="btn" onClick={() => { atualizarProf(ed.id, { valores: ed.valores }); setEd(null); }}>Salvar</button></div></Modal>}
  </>);
}
