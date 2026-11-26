"use client";
import { Fragment, useState } from "react";
import { Icon } from "@/components/Icon";
import { PageHead } from "@/components/ui";
import { useProf } from "@/lib/useProf";
import { DIAS } from "@/lib/util";
const HORAS = Array.from({ length: 15 }, (_, i) => i + 7);
const ORDEM = [1, 2, 3, 4, 5, 6, 0];
const LONGO = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;
export default function Disp() {
  const { prof, atualizarProf } = useProf();
  const [dia, setDia] = useState(() => { const d = new Date().getDay(); return d; });
  if (!prof) return null;
  const tog = (k: string) => atualizarProf(prof.id, { disp: prof.disp.includes(k) ? prof.disp.filter((x) => x !== k) : [...prof.disp, k] });
  const doDia = (d: number) => prof.disp.filter((k) => k.startsWith(`${d}-`)).length;
  return (<div className="main-inner" style={{ maxWidth: 960 }}>
    <PageHead title="Disponibilidade" sub="Marque os horários em que você pode dar aula. A administração confirma cada aula com você antes de agendar." />

    {/* desktop: grade semanal */}
    <section className="panel pad hide-m" aria-label="Grade semanal de disponibilidade">
      <div className="dispgrid" role="grid">
        <div />{ORDEM.map((d) => <div className="h" key={d}>{DIAS[d]}<div className="xs" style={{ fontWeight: 400 }}>{doDia(d) ? `${doDia(d)}h` : "—"}</div></div>)}
        {HORAS.map((h) => (<Fragment key={h}><div className="l">{hh(h)}</div>{ORDEM.map((d) => { const k = `${d}-${h}`; const on = prof.disp.includes(k); return (
          <button key={k} aria-label={`${LONGO[d]}, ${hh(h)} às ${hh(h + 1)}`} aria-pressed={on} className={`cell ${on ? "on" : ""}`} onClick={() => tog(k)} />); })}</Fragment>))}
      </div>
    </section>

    {/* celular: um dia por vez */}
    <div className="days" role="tablist" aria-label="Dia da semana">
      {ORDEM.map((d) => <button key={d} role="tab" aria-selected={dia === d} onClick={() => setDia(d)}><b>{DIAS[d]}</b><span>{doDia(d) ? `${doDia(d)}h` : "—"}</span></button>)}
    </div>
    <section className="panel slots" aria-label={`Horários de ${LONGO[dia]}`} style={{ overflow: "hidden" }}>
      <div className="panel-head" style={{ padding: "12px 16px" }}><h2>{LONGO[dia]}</h2><span className="small muted">{doDia(dia) ? `${doDia(dia)} horas livres` : "Sem horários"}</span></div>
      {HORAS.map((h) => { const k = `${dia}-${h}`; const on = prof.disp.includes(k); return (
        <button key={k} className={`slot ${on ? "on" : ""}`} role="switch" aria-checked={on} onClick={() => tog(k)}>
          <span className="grow">{hh(h)} às {hh(h + 1)}</span><span className="switch" aria-hidden="true" {...{ "aria-checked": on }} />
        </button>); })}
    </section>

    <p className="small muted row" role="status" style={{ flexWrap: "nowrap" }}><Icon name="check" size={16} stroke={2.25} style={{ color: "var(--ok)" }} />Salvo automaticamente · {prof.disp.length} horas por semana</p>
  </div>);
}
