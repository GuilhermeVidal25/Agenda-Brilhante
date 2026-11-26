"use client";
import Link from "next/link";
import { useState } from "react";
import { DetalheAula, NovaAula } from "@/components/AulaModais";
import { Icon } from "@/components/Icon";
import { PageHead, Stat, StatusPill, corProf } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { Aula } from "@/lib/types";
import { addDays, fimAula, fmtData, inicioAula, iso, startOfWeek } from "@/lib/util";

const saudacao = () => { const h = new Date().getHours(); return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"; };
const faltam = (a: Aula) => { const m = Math.round((+inicioAula(a) - Date.now()) / 60000); if (m <= 0 || m > 12 * 60) return null; return m >= 60 ? `em ${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}` : `em ${m} min`; };

export default function Inicio() {
  const { db, sessao } = useApp();
  const [sel, setSel] = useState<string | null>(null);
  const [nova, setNova] = useState(false);
  const ini = startOfWeek(new Date()); const fim = addDays(ini, 6);
  const hoje = iso(new Date()); const amanha = iso(addDays(new Date(), 1));
  const semana = db.aulas.filter((a) => a.data >= iso(ini) && a.data <= iso(fim));
  const aConferir = db.aulas.filter((a) => a.relatorio && !a.relatorio.verificado);
  const semRel = db.aulas.filter((a) => a.status === "agendada" && +inicioAula(a) + a.duracao * 60000 < Date.now());
  const pend = db.professores.filter((p) => p.status === "pendente");
  const ord = (a: Aula, b: Aula) => +inicioAula(a) - +inicioAula(b);
  const deHoje = db.aulas.filter((a) => a.data === hoje && a.status !== "cancelada").sort(ord);
  const deAmanha = db.aulas.filter((a) => a.data === amanha && a.status === "agendada").sort(ord);
  const prox = deHoje.length + deAmanha.length === 0 ? db.aulas.filter((a) => a.status === "agendada" && inicioAula(a) >= new Date()).sort(ord).slice(0, 5) : [];
  const canc = semana.filter((a) => a.status.startsWith("cancelada"));
  const tardias = semana.filter((a) => a.status === "cancelada_tardia").length;
  const ativasSem = semana.filter((a) => !a.status.startsWith("cancelada"));
  const feitas = semana.filter((a) => a.status === "realizada").length;
  const nAtt = pend.length + aConferir.length + semRel.length;
  const nomeP = (id: string) => db.professores.find((p) => p.id === id)?.nome ?? "";
  const nomeA = (id: string) => db.alunos.find((x) => x.id === id)?.nome ?? "";
  const nome = sessao?.papel === "admin" ? sessao.nome : "";
  const dataHoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }).replace(/^./, (c) => c.toUpperCase());

  const Linha = ({ a }: { a: Aula }) => { const f = a.data === hoje ? faltam(a) : null; return (
    <button className="list-row" onClick={() => setSel(a.id)}>
      <span className="when"><b>{a.hora}</b><span>até {fimAula(a)}</span></span>
      <span className="bar" style={{ background: corProf(db.professores, a.profId).c }} />
      <span className="what"><b>{a.materia}</b><span>{nomeP(a.profId)} com {nomeA(a.alunoId)}{a.serieId ? " · aula fixa" : ""}</span></span>
      {f && a.status === "agendada" && <span className="xs" style={{ color: "var(--warn)", fontWeight: 500 }}>{f}</span>}
      <StatusPill s={a.status} />
    </button>); };

  return (<div className="main-inner">
    <PageHead overline={dataHoje} title={`${saudacao()}, ${nome}`}>
      <Link href="/admin/agenda" className="btn sec">Abrir agenda</Link>
      <button className="btn" onClick={() => setNova(true)}><Icon name="plus" stroke={2} />Nova aula</button>
    </PageHead>

    <section className="panel stats" aria-label="Resumo da semana">
      <Stat k="Aulas nesta semana" v={ativasSem.length} s={`${fmtData(iso(ini))} a ${fmtData(iso(fim))}`} />
      <Stat k="Realizadas" v={feitas} s={`${ativasSem.length - feitas} ainda por acontecer`} />
      <Stat k="Canceladas" v={canc.length} s={tardias ? `${tardias} fora do prazo de 4h` : "nenhuma fora do prazo de 4h"} />
      <Stat k="Relatórios a conferir" v={aConferir.length} attn={aConferir.length > 0} s={aConferir.length ? <a href="#atencao">Ver pendências</a> : "tudo conferido"} />
    </section>

    <div className="split">
      <section className="panel main-col" aria-labelledby="h-hoje" style={{ overflow: "hidden" }}>
        <div className="panel-head"><h2 id="h-hoje">Hoje</h2><span className="small muted">{deHoje.length} {deHoje.length === 1 ? "aula" : "aulas"}</span></div>
        {deHoje.length === 0 && <p className="muted" style={{ padding: "0 20px 16px" }}>Nenhuma aula hoje.</p>}
        {deHoje.map((a) => <Linha key={a.id} a={a} />)}
        {deAmanha.length > 0 && <><div className="sub-head"><h3>Amanhã</h3></div>{deAmanha.map((a) => <Linha key={a.id} a={a} />)}</>}
        {prox.length > 0 && <><div className="sub-head"><h3>Próximas aulas</h3></div>{prox.map((a) => <Linha key={a.id} a={a} />)}</>}
      </section>

      <div className="side-col">
        <section id="atencao" className="panel" aria-labelledby="h-at" style={{ overflow: "hidden" }}>
          <div className="panel-head"><h2 id="h-at">Precisa da sua atenção</h2>{nAtt > 0 && <span className="count" style={{ marginLeft: 0 }}>{nAtt}</span>}</div>
          {nAtt === 0 && <p className="muted" style={{ padding: "0 20px 18px" }}>Tudo em dia.</p>}
          {pend.map((p) => (<div key={p.id} className="attn-item">
            <span className="attn-icon brand"><Icon name="cap" /></span>
            <div className="grow stack" style={{ gap: 8 }}><span><b>{p.nome}</b> pediu acesso como professor<br /><span className="small muted">{p.materias.join(", ")}</span></span>
              <span><Link className="btn sec sm" href="/admin/professores">Revisar cadastro</Link></span></div>
          </div>))}
          {aConferir.map((a) => (<div key={a.id} className="attn-item">
            <span className="attn-icon warn"><Icon name="file" /></span>
            <div className="grow stack" style={{ gap: 8 }}><span>Relatório de <b>{nomeP(a.profId)}</b> aguarda conferência<br /><span className="small muted">{a.materia} com {nomeA(a.alunoId).split(" ")[0]} · {fmtData(a.data)}</span></span>
              <span><button className="btn sec sm" onClick={() => setSel(a.id)}>Conferir relatório</button></span></div>
          </div>))}
          {semRel.map((a) => (<div key={a.id} className="attn-item">
            <span className="attn-icon warn"><Icon name="clock" /></span>
            <div className="grow stack" style={{ gap: 8 }}><span><b>{nomeP(a.profId)}</b> ainda não enviou o relatório<br /><span className="small muted">{a.materia} com {nomeA(a.alunoId).split(" ")[0]} · {fmtData(a.data)}</span></span>
              <span><button className="btn sec sm" onClick={() => setSel(a.id)}>Ver aula</button></span></div>
          </div>))}
        </section>
        <section aria-labelledby="h-reg" className="stack" style={{ gap: 10, padding: "4px 4px 0" }}>
          <h2 id="h-reg" className="small" style={{ color: "var(--ink-700)" }}>Regras do curso</h2>
          <p className="small muted">Só a administração cria, cancela, reagenda e registra aulas.</p>
          <p className="small muted">O responsável pode cancelar até 4h antes. Fora do prazo, paga a aula integral ao curso.</p>
          <p className="small muted">O professor só entra depois da aprovação e do e-mail de liberação.</p>
        </section>
      </div>
    </div>
    {sel && <DetalheAula id={sel} admin onClose={() => setSel(null)} />}
    {nova && <NovaAula onClose={() => setNova(false)} />}
  </div>);
}
