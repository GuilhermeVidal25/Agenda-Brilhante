"use client";
import { useState } from "react";
import { DetalheAula, NovaAula } from "@/components/AulaModais";
import { Icon } from "@/components/Icon";
import { PageHead, corProf } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { Aula } from "@/lib/types";
import { DIAS, addDays, fimAula, fromMin, inicioAula, iso, startOfWeek, toMin } from "@/lib/util";

const HH = 60; // altura de 1 hora na grade (px)
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const off = (a: Aula) => a.status === "cancelada" || a.status === "cancelada_tardia";

// distribui aulas sobrepostas do mesmo dia lado a lado
function lanes(list: Aula[]) {
  const sorted = [...list].sort((a, b) => toMin(a.hora) - toMin(b.hora));
  const out = new Map<string, { lane: number; of: number }>();
  let cluster: Aula[] = []; let clusterEnd = -1; let ends: number[] = [];
  const flush = () => { const n = ends.length; cluster.forEach((a) => { const o = out.get(a.id)!; out.set(a.id, { lane: o.lane, of: n }); }); cluster = []; ends = []; };
  for (const a of sorted) {
    const s = toMin(a.hora), e = s + a.duracao;
    if (s >= clusterEnd) { flush(); clusterEnd = -1; }
    let lane = ends.findIndex((x) => x <= s); if (lane < 0) { lane = ends.length; ends.push(e); } else ends[lane] = e;
    out.set(a.id, { lane, of: 1 }); cluster.push(a); clusterEnd = Math.max(clusterEnd, e);
  }
  flush();
  return out;
}

export default function Agenda() {
  const { db } = useApp();
  const [ini, setIni] = useState(() => startOfWeek(new Date()));
  const [profId, setProfId] = useState("todos");
  const [nova, setNova] = useState<{ data?: string; hora?: string } | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const agora = new Date(); const hoje = iso(agora);
  const dias = Array.from({ length: 7 }, (_, i) => addDays(ini, i));
  const [diaM, setDiaM] = useState(() => { const i = dias.findIndex((d) => iso(d) === hoje); return i < 0 ? 0 : i; });
  const ativos = db.professores.filter((p) => p.status === "ativo");
  const doFiltro = (a: Aula) => profId === "todos" || a.profId === profId;
  const daSemana = db.aulas.filter((a) => a.data >= iso(dias[0]) && a.data <= iso(dias[6]));
  const visiveis = daSemana.filter(doFiltro);
  const START = Math.min(7, ...visiveis.map((a) => Math.floor(toMin(a.hora) / 60)));
  const END = Math.max(22, ...visiveis.map((a) => Math.ceil((toMin(a.hora) + a.duracao) / 60)));
  const altura = (END - START) * HH;
  const yDe = (min: number) => ((min - START * 60) / 60) * HH;
  const prof = ativos.find((p) => p.id === profId);
  const nome = (id: string) => db.professores.find((p) => p.id === id)?.nome.split(" ")[0] ?? "";
  const aluno = (id: string) => db.alunos.find((x) => x.id === id)?.nome ?? "";
  const pendRel = (a: Aula) => (a.relatorio && !a.relatorio.verificado) || (a.status === "agendada" && +inicioAula(a) + a.duracao * 60000 < Date.now());

  const resumo = {
    total: daSemana.filter((a) => !off(a)).length,
    feitas: daSemana.filter((a) => a.status === "realizada").length,
    canc: daSemana.filter(off).length,
    rel: daSemana.filter(pendRel).length,
  };
  const f = dias[0], l = dias[6];
  const titulo = f.getMonth() === l.getMonth() ? `${f.getDate()} a ${l.getDate()} de ${MESES[l.getMonth()]} de ${l.getFullYear()}` : `${f.getDate()} de ${MESES[f.getMonth()]} a ${l.getDate()} de ${MESES[l.getMonth()]} de ${l.getFullYear()}`;
  const disp = (d: Date) => {
    if (!prof) return [];
    const dow = d.getDay(); const hs = prof.disp.filter((k) => k.startsWith(`${dow}-`)).map((k) => Number(k.split("-")[1])).sort((a, b) => a - b);
    const r: [number, number][] = []; hs.forEach((h) => { const last = r[r.length - 1]; if (last && last[1] === h) last[1] = h + 1; else r.push([h, h + 1]); });
    return r;
  };
  const clickSlot = (e: React.MouseEvent<HTMLDivElement>, d: Date) => {
    if (e.target !== e.currentTarget) return;
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
    const min = Math.floor((START * 60 + (y / HH) * 60) / 30) * 30;
    setNova({ data: iso(d), hora: fromMin(Math.min(min, 23 * 60)) });
  };
  const evProps = (a: Aula) => {
    const cor = corProf(db.professores, a.profId);
    return { cor, style: { background: cor.bg, borderColor: cor.bd } };
  };
  const nowMin = agora.getHours() * 60 + agora.getMinutes();
  const sm = dias[diaM];

  return (<div className="main-inner wide">
    <PageHead title="Agenda" sub={`${resumo.total} ${resumo.total === 1 ? "aula" : "aulas"} nesta semana · ${resumo.feitas} realizada${resumo.feitas === 1 ? "" : "s"} · ${resumo.canc} cancelada${resumo.canc === 1 ? "" : "s"}${resumo.rel ? ` · ${resumo.rel} relatório${resumo.rel === 1 ? "" : "s"} aguardando` : ""}`}>
      <button className="btn" onClick={() => setNova({ data: iso(sm ?? new Date()) })}><Icon name="plus" stroke={2} />Nova aula</button>
    </PageHead>

    <div className="toolbar">
      <div className="row" style={{ gap: 4, flexWrap: "nowrap" }}>
        <button className="btn sec icon" aria-label="Semana anterior" onClick={() => setIni(addDays(ini, -7))}><Icon name="left" /></button>
        <button className="btn sec" onClick={() => { setIni(startOfWeek(new Date())); setDiaM(((agora.getDay() + 6) % 7)); }}>Hoje</button>
        <button className="btn sec icon" aria-label="Próxima semana" onClick={() => setIni(addDays(ini, 7))}><Icon name="right" /></button>
        <span style={{ fontWeight: 600, fontSize: 15, marginLeft: 10 }} aria-live="polite">{titulo}</span>
      </div>
      <span className="grow hide-m" />
      <div className="fchips" role="group" aria-label="Filtrar por professor">
        <button className="fchip" aria-pressed={profId === "todos"} onClick={() => setProfId("todos")}><span className="dot" style={{ background: "var(--ink-400)" }} />Todos</button>
        {ativos.map((p) => <button key={p.id} className="fchip" aria-pressed={profId === p.id} onClick={() => setProfId(p.id)}><span className="dot" style={{ background: corProf(db.professores, p.id).c }} />{p.nome.split(" ")[0]}</button>)}
      </div>
    </div>

    {/* desktop: grade da semana */}
    <section className="cal" aria-label="Calendário da semana">
      <div className="cal-inner">
        <div className="cal-cols cal-head">
          <div />
          {dias.map((d) => { const n = daSemana.filter((a) => a.data === iso(d) && !off(a) && doFiltro(a)).length; return (
            <div key={iso(d)} className={`cal-day-h ${iso(d) === hoje ? "today" : ""}`}>
              <span className="dw">{DIAS[d.getDay()]}</span><span className="dn" aria-label={d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}>{d.getDate()}</span>
              {n > 0 && <span className="dc">{n} {n === 1 ? "aula" : "aulas"}</span>}
            </div>); })}
        </div>
        <div className="cal-cols" style={{ ["--hh" as string]: `${HH}px` }}>
          <div className="cal-hours" style={{ height: altura }} aria-hidden="true">
            {Array.from({ length: END - START }, (_, i) => <span key={i} style={{ top: i === 0 ? 2 : i * HH - 6 }}>{fromMin((START + i) * 60)}</span>)}
          </div>
          {dias.map((d, i) => { const k = iso(d); const list = visiveis.filter((a) => a.data === k); const L = lanes(list); return (
            <div key={k} className={`cal-col ${i > 4 && !prof ? "weekend" : ""} ${prof ? "dim" : ""}`} style={{ height: altura }} onClick={(e) => clickSlot(e, d)} title="Clique num horário vazio para agendar">
              {disp(d).map(([a, b]) => <div key={a} className="avail" style={{ top: (a - START) * HH, height: (b - a) * HH }} />)}
              {k === hoje && nowMin >= START * 60 && nowMin <= END * 60 && <div className="now" style={{ top: yDe(nowMin) }} />}
              {list.map((a) => { const { cor, style } = evProps(a); const pos = L.get(a.id)!; const w = 100 / pos.of; return (
                <button key={a.id} className={`ev ${off(a) ? "off" : ""} ${sel === a.id ? "sel" : ""}`} onClick={() => setSel(a.id)}
                  aria-label={`${a.materia}, ${a.hora} às ${fimAula(a)}, ${nome(a.profId)} com ${aluno(a.alunoId)}`}
                  style={{ ...style, top: yDe(toMin(a.hora)) + 1, height: (a.duracao / 60) * HH - 3, left: `calc(${pos.lane * w}% + 4px)`, width: `calc(${w}% - 8px)` }}>
                  <span className="ev-t" style={{ color: cor.c }}><span>{a.hora} – {fimAula(a)}</span>
                    {a.status === "realizada" && <Icon name="check" size={14} stroke={2.25} label="Realizada" style={{ color: "var(--ok)" }} />}
                    {pendRel(a) && !off(a) && <Icon name="filePend" size={14} stroke={2} label="Relatório pendente ou a conferir" style={{ color: "var(--warn-icon)" }} />}
                    {a.serieId && <Icon name="repeat" size={13} stroke={2} label="Aula fixa" />}</span>
                  <span className="ev-m">{a.materia}</span>
                  <span className="ev-w">{a.status === "cancelada_tardia" ? <b style={{ color: "var(--warn)" }}>Fora do prazo</b> : `${nome(a.profId)} · ${aluno(a.alunoId).split(" ")[0]}`}</span>
                </button>); })}
            </div>); })}
        </div>
      </div>
    </section>
    <div className="legend">
      <span><Icon name="repeat" size={13} stroke={2} />Aula fixa</span>
      <span><Icon name="check" size={13} stroke={2.25} style={{ color: "var(--ok)" }} />Realizada</span>
      <span><Icon name="filePend" size={13} stroke={2} style={{ color: "var(--warn-icon)" }} />Relatório pendente ou a conferir</span>
      <span><span style={{ width: 14, height: 10, border: "1px dashed var(--line-hover)", borderRadius: 3 }} />Cancelada</span>
      <span>{prof ? `Faixa tracejada: disponibilidade de ${prof.nome.split(" ")[0]}.` : "Escolha um professor para ver a disponibilidade na grade. Clique num horário vazio para agendar."}</span>
    </div>

    {/* celular: um dia por vez */}
    <div className="daystrip" role="tablist" aria-label="Dias da semana">
      {dias.map((d, i) => { const has = daSemana.some((a) => a.data === iso(d) && doFiltro(a)); return (
        <button key={iso(d)} role="tab" aria-selected={diaM === i} onClick={() => setDiaM(i)}>
          <span className="dw">{DIAS[d.getDay()]}</span><span className="dn">{d.getDate()}</span><span className={`dd ${has ? "" : "none"}`} />
        </button>); })}
    </div>
    <div className="day-list">
      {(() => { const list = visiveis.filter((a) => a.data === iso(sm)).sort((a, b) => toMin(a.hora) - toMin(b.hora)); const isHoje = iso(sm) === hoje; let nowShown = false; return (<>
        <div className="row"><h2 className="grow">{sm.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric" }).replace(/^./, (c) => c.toUpperCase())}</h2><span className="small muted">{list.filter((a) => !off(a)).length} aulas</span></div>
        {list.length === 0 && <div className="panel"><div className="empty" style={{ padding: 28 }}><span className="empty-icon"><Icon name="calendar" size={22} /></span><p>Nenhuma aula neste dia.</p><button className="btn sec" onClick={() => setNova({ data: iso(sm) })}>Agendar aula</button></div></div>}
        {list.map((a) => { const { cor, style } = evProps(a); const showNow = isHoje && !nowShown && toMin(a.hora) > nowMin; if (showNow) nowShown = true; return (<div key={a.id} style={{ display: "contents" }}>
          {showNow && <div className="row small" style={{ color: "var(--bad)", fontWeight: 600, flexWrap: "nowrap" }}><span className="dot" style={{ background: "var(--bad)" }} />Agora, {fromMin(nowMin)}<span className="grow" style={{ height: 2, background: "var(--bad)", borderRadius: 2 }} /></div>}
          <button className={`day-ev ${off(a) ? "off" : ""}`} style={style} onClick={() => setSel(a.id)}>
            <span style={{ width: 50, flex: "none", display: "flex", flexDirection: "column" }}><b style={{ color: cor.c }}>{a.hora}</b><span className="xs" style={{ color: "var(--ink-600)" }}>{fimAula(a)}</span></span>
            <span className="grow" style={{ display: "flex", flexDirection: "column", gap: 2 }}><b className="m">{a.materia}</b><span className="small" style={{ color: "var(--ink-700)" }}>{db.professores.find((p) => p.id === a.profId)?.nome} · {aluno(a.alunoId)}</span>
              {a.status === "realizada" && <span className="xs" style={{ color: "var(--ok)", fontWeight: 600 }}>Realizada</span>}
              {a.status === "cancelada_tardia" && <span className="xs" style={{ color: "var(--warn)", fontWeight: 600 }}>Cancelada fora do prazo</span>}
              {pendRel(a) && !off(a) && <span className="xs" style={{ color: "var(--warn)", fontWeight: 600 }}>Relatório pendente ou a conferir</span>}</span>
            {a.serieId && <Icon name="repeat" size={15} stroke={2} label="Aula fixa" style={{ color: cor.c }} />}
          </button></div>); })}
      </>); })()}
    </div>

    {nova && <NovaAula inicial={{ data: nova.data, hora: nova.hora, profId: profId === "todos" ? undefined : profId }} onClose={() => setNova(null)} />}
    {sel && <DetalheAula id={sel} admin onClose={() => setSel(null)} />}
  </div>);
}
