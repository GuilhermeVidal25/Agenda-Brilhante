"use client";
import { useState } from "react";
import { DetalheAula, NovaAula } from "@/components/AulaModais";
import { useApp } from "@/lib/store";
import { DIAS, addDays, durLabel, fimAula, iso, parseISO, startOfWeek, toMin } from "@/lib/util";

export default function Agenda() {
  const { db } = useApp();
  const [ini, setIni] = useState(() => startOfWeek(new Date()));
  const [profId, setProfId] = useState("todos");
  const [nova, setNova] = useState<{ data?: string } | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const hoje = iso(new Date());
  const dias = Array.from({ length: 7 }, (_, i) => addDays(ini, i));
  const titulo = `${dias[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} a ${dias[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}`;
  return (<>
    <div className="top"><div className="grow"><h1>Agenda</h1><p className="muted">{titulo}</p></div>
      <select className="in" style={{ width: 220 }} value={profId} onChange={(e) => setProfId(e.target.value)}>
        <option value="todos">Todos os professores</option>{db.professores.filter((p) => p.status === "ativo").map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
      <div className="row"><button className="btn ghost" onClick={() => setIni(addDays(ini, -7))}>←</button><button className="btn ghost" onClick={() => setIni(startOfWeek(new Date()))}>Hoje</button><button className="btn ghost" onClick={() => setIni(addDays(ini, 7))}>→</button></div>
      <button className="btn" onClick={() => setNova({})}>+ Nova aula</button></div>
    <div className="week">{dias.map((d) => {
      const k = iso(d);
      const aulas = db.aulas.filter((a) => a.data === k && (profId === "todos" || a.profId === profId)).sort((a, b) => toMin(a.hora) - toMin(b.hora));
      return (<div key={k} className={`day ${k === hoje ? "hoje" : ""}`}>
        <h4><span>{DIAS[d.getDay()]}</span><b>{d.getDate()}</b></h4>
        {aulas.map((a) => (<button key={a.id} className={`aula ${a.status}`} onClick={() => setSel(a.id)}>
          <b>{a.hora}–{fimAula(a)} · {a.materia}</b>
          <span>{db.professores.find((p) => p.id === a.profId)?.nome.split(" ")[0]} · {db.alunos.find((x) => x.id === a.alunoId)?.nome.split(" ")[0]} · {durLabel(a.duracao)}{a.serieId ? " · fixa" : ""}</span></button>))}
        <button className="btn ghost sm" style={{ width: "100%" }} onClick={() => setNova({ data: k })}>+ aula</button>
      </div>);
    })}</div>
    {nova && <NovaAula inicial={{ data: nova.data, profId: profId === "todos" ? undefined : profId }} onClose={() => setNova(null)} />}
    {sel && <DetalheAula id={sel} admin onClose={() => setSel(null)} />}
    <p className="muted small" style={{ marginTop: 14 }}>Dica: toque numa aula para cancelar, reagendar, registrar ou conferir o relatório. Aulas fixas aparecem marcadas com “fixa”.</p>
  </>);
}
void parseISO;
