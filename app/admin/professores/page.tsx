"use client";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Avatar, Modal, ModalHead, PageHead, corProf } from "@/components/ui";
import { useApp } from "@/lib/store";
import { DIAS, DURACOES, brl, durLabel } from "@/lib/util";
import type { Professor } from "@/lib/types";

export default function Professores() {
  const { db, aprovarProf, atualizarProf } = useApp();
  const [ed, setEd] = useState<Professor | null>(null);
  const pend = db.professores.filter((p) => p.status === "pendente");
  const ativos = db.professores.filter((p) => p.status === "ativo").length;
  const resumoDisp = (p: Professor) => p.disp.length ? `${p.disp.length}h por semana · ${[...new Set(p.disp.map((x) => Number(x.split("-")[0])))].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => DIAS[d]).join(", ")}` : "Ainda não informada";
  return (<div className="main-inner">
    <PageHead title="Professores" sub={`${ativos} ativos${pend.length ? ` · ${pend.length} aguardando aprovação` : ""}`} />

    {pend.length > 0 && (
      <section className="panel" aria-labelledby="h-pend" style={{ borderColor: "var(--warn-line)", overflow: "hidden" }}>
        <div className="panel-head" style={{ background: "var(--warn-soft)" }}><Icon name="clock" style={{ color: "var(--warn)" }} /><h2 id="h-pend">Cadastros para aprovar</h2></div>
        {pend.map((p) => (<div key={p.id} className="attn-item" style={{ alignItems: "center", flexWrap: "wrap" }}>
          <div className="who grow"><Avatar nome={p.nome} /><div className="who-txt"><b>{p.nome}</b><span>{p.email} · {p.materias.join(", ")}</span></div></div>
          <button className="btn" onClick={() => aprovarProf(p.id)}><Icon name="check" stroke={2} />Aprovar e avisar por e-mail</button>
        </div>))}
      </section>)}

    <section className="panel" aria-label="Lista de professores" style={{ overflow: "hidden" }}>
      <div className="table-wrap"><table className="t">
        <thead><tr><th>Professor</th><th className="hide-m">Matérias</th><th className="hide-m">Valor por aula</th><th className="hide-m">Chave Pix</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>{db.professores.filter((p) => p.status !== "pendente").map((p) => (<tr key={p.id}>
          <td><div className="who"><Avatar nome={p.nome} cor={corProf(db.professores, p.id)} /><div className="who-txt"><b>{p.nome}</b><span>{p.email}</span><span className="only-m">{p.materias.join(", ")}</span></div></div></td>
          <td className="hide-m">{p.materias.join(", ")}</td>
          <td className="hide-m"><span className="row" style={{ gap: 6 }}>{DURACOES.map((d) => <span key={d} className="chip outline">{durLabel(d)} · {brl(p.valores[d])}</span>)}</span></td>
          <td className="hide-m">{p.pix || <span className="chip warn">Não informado</span>}</td>
          <td className="num"><button className="btn sec sm" onClick={() => setEd(p)}>Editar valores</button></td>
        </tr>))}</tbody>
      </table></div>
    </section>

    {ed && (
      <Modal onClose={() => setEd(null)} narrow label={`Valores de ${ed.nome}`}>
        <ModalHead title={`Valores de ${ed.nome}`} sub="Valor pago ao professor por duração de aula." onClose={() => setEd(null)} />
        <div className="m-body">
          {DURACOES.map((d) => (<label key={d} className="field"><span className="label">Aula de {durLabel(d)} (R$)</span>
            <input className="in" type="number" min={0} step="0.5" inputMode="decimal" value={ed.valores[d]} onChange={(e) => setEd({ ...ed, valores: { ...ed.valores, [d]: Number(e.target.value) } })} /></label>))}
          <div className="box"><div className="kv"><div className="k">Disponibilidade informada</div><div>{resumoDisp(ed)}</div></div></div>
        </div>
        <div className="m-foot"><span className="grow hide-m" /><button className="btn ghost" onClick={() => setEd(null)}>Cancelar</button><button className="btn" onClick={() => { atualizarProf(ed.id, { valores: ed.valores }); setEd(null); }}>Salvar valores</button></div>
      </Modal>)}
  </div>);
}
