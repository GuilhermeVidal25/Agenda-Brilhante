"use client";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { DateBox, Empty, Modal, ModalHead, PageHead, StatusPill } from "@/components/ui";
import { useProf } from "@/lib/useProf";
import type { Aula } from "@/lib/types";
import { brl, durLabel, fimAula, fmtData, inicioAula, iso, parseISO, valorAula } from "@/lib/util";

export default function Aulas() {
  const { db, prof, enviarRelatorio } = useProf();
  const [id, setId] = useState<string | null>(null); const [c, setC] = useState(""); const [at, setAt] = useState("");
  if (!prof) return null;
  const minhas = db.aulas.filter((a) => a.profId === prof.id);
  const fim = (a: Aula) => +inicioAula(a) + a.duracao * 60000;
  const podeRel = (a: Aula) => a.status === "agendada" && fim(a) < Date.now();
  const pend = minhas.filter(podeRel).sort((a, b) => +inicioAula(a) - +inicioAula(b));
  const prox = minhas.filter((a) => a.status === "agendada" && fim(a) >= Date.now()).sort((a, b) => +inicioAula(a) - +inicioAula(b));
  const ant = minhas.filter((a) => a.status !== "agendada").sort((a, b) => +inicioAula(b) - +inicioAula(a));
  const alvo = minhas.find((a) => a.id === id);
  const nomeA = (x: string) => db.alunos.find((al) => al.id === x)?.nome ?? "";
  const hoje = iso(new Date());
  const n = c.trim().length;
  const abrir = (a: Aula) => { setId(a.id); setC(""); setAt(""); };

  const Linha = ({ a }: { a: Aula }) => (
    <div className="list-row" style={{ flexWrap: "wrap" }}>
      <DateBox d={parseISO(a.data)} today={a.data === hoje} />
      <span className="what"><b style={a.status.startsWith("cancelada") ? { textDecoration: "line-through", color: "var(--muted)" } : undefined}>{a.materia}</b>
        <span>{nomeA(a.alunoId)} · {a.hora} às {fimAula(a)} · {durLabel(a.duracao)}</span>
        {a.relatorio && <span className="xs" style={{ color: "var(--ok)" }}>Relatório enviado</span>}</span>
      <span className="small muted hide-m" style={{ width: 88, textAlign: "right" }}>{a.status.startsWith("cancelada") ? "" : brl(valorAula(prof, a))}</span>
      <StatusPill s={a.status} />
    </div>);

  return (<div className="main-inner" style={{ maxWidth: 880 }}>
    <PageHead title="Minhas aulas" sub="A administração agenda e reagenda. Você registra a aula enviando o relatório." />
    {minhas.length === 0 && <div className="panel"><Empty icon="calendar" title="Nenhuma aula ainda">Quando a administração agendar uma aula com você, ela aparece aqui e você recebe um e-mail.</Empty></div>}

    {pend.length > 0 && (
      <section aria-labelledby="h-pend" className="stack" style={{ gap: 8 }}>
        <h2 id="h-pend" className="small" style={{ color: "var(--warn)" }}>Precisa de relatório</h2>
        <div className="panel" style={{ borderColor: "var(--warn-line)", overflow: "hidden" }}>
          {pend.map((a) => (<div key={a.id} className="list-row" style={{ flexWrap: "wrap" }}>
            <DateBox d={parseISO(a.data)} today={a.data === hoje} />
            <span className="what"><b>{a.materia}</b><span>{nomeA(a.alunoId)} · {a.hora} às {fimAula(a)}</span></span>
            <button className="btn" onClick={() => abrir(a)}><Icon name="file" />Enviar relatório</button>
          </div>))}
        </div>
      </section>)}

    {prox.length > 0 && (
      <section aria-labelledby="h-prox" className="stack" style={{ gap: 8 }}>
        <h2 id="h-prox" className="small" style={{ color: "var(--ink-700)" }}>Próximas</h2>
        <div className="panel" style={{ overflow: "hidden" }}>{prox.map((a) => <Linha key={a.id} a={a} />)}</div>
      </section>)}

    {ant.length > 0 && (
      <section aria-labelledby="h-ant" className="stack" style={{ gap: 8 }}>
        <h2 id="h-ant" className="small" style={{ color: "var(--ink-700)" }}>Anteriores</h2>
        <div className="panel" style={{ overflow: "hidden" }}>{ant.map((a) => <Linha key={a.id} a={a} />)}</div>
      </section>)}

    {alvo && (
      <Modal onClose={() => setId(null)} narrow label="Relatório da aula">
        <ModalHead title="Relatório da aula" sub={`${alvo.materia} · ${fmtData(alvo.data)} · ${nomeA(alvo.alunoId)}. Vai para a administração e para o responsável.`} onClose={() => setId(null)} />
        <div className="m-body">
          <label className="field"><span className="label">O que foi trabalhado na aula</span>
            <textarea className="in" data-autofocus rows={4} value={c} onChange={(e) => setC(e.target.value)} placeholder="Ex.: Equações do 2º grau e resolução de problemas." />
            <span className={`hint ${n >= 5 ? "ok" : ""}`}>{n === 0 ? "Obrigatório. Escreva ao menos uma frase curta." : n < 5 ? "Continue escrevendo…" : "Pronto para enviar."}</span></label>
          <label className="field"><span className="label">Atividade deixada para o aluno <span className="opt">(opcional)</span></span>
            <textarea className="in" rows={2} value={at} onChange={(e) => setAt(e.target.value)} placeholder="Ex.: Exercícios 1 a 8 da apostila." /></label>
        </div>
        <div className="m-foot"><span className="grow hide-m" /><button className="btn ghost" onClick={() => setId(null)}>Cancelar</button>
          <button className="btn" disabled={n < 5} onClick={() => { enviarRelatorio(alvo.id, { conteudo: c.trim(), atividade: at.trim() }); setId(null); }}><Icon name="check" stroke={2} />Enviar relatório</button></div>
      </Modal>)}
  </div>);
}
