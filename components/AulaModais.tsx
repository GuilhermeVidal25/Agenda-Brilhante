"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import type { Aula, Duracao } from "@/lib/types";
import { DURACOES, brl, dentroDisp, durLabel, fimAula, fmtData, horasAte, iso, parseISO, addDays, sobrepoe, valorAula } from "@/lib/util";
import { Modal, StatusPill } from "./ui";

const ativa = (a: Aula) => a.status === "agendada" || a.status === "realizada";

export function NovaAula({ onClose, inicial }: { onClose: () => void; inicial?: { data?: string; profId?: string } }) {
  const { db, criarAulas } = useApp();
  const profs = db.professores.filter((p) => p.status === "ativo");
  const [profId, setProfId] = useState(inicial?.profId ?? profs[0]?.id ?? "");
  const [alunoId, setAlunoId] = useState(db.alunos.find((a) => a.pacote === "ativo")?.id ?? "");
  const prof = profs.find((p) => p.id === profId);
  const [materia, setMateria] = useState("");
  const [data, setData] = useState(inicial?.data ?? iso(new Date()));
  const [hora, setHora] = useState("15:00");
  const [duracao, setDuracao] = useState<Duracao>(60);
  const [fixa, setFixa] = useState(false); const [semanas, setSemanas] = useState(4);
  const [forcar, setForcar] = useState(false);
  const mat = materia || prof?.materias[0] || "";
  const datas = useMemo(() => Array.from({ length: fixa ? semanas : 1 }, (_, i) => iso(addDays(parseISO(data), 7 * i))), [data, fixa, semanas]);
  const analise = useMemo(() => {
    const conflitos: string[] = []; const fora: string[] = [];
    datas.forEach((d) => {
      const n = { data: d, hora, duracao };
      db.aulas.filter(ativa).forEach((x) => {
        if (!sobrepoe(n, x)) return;
        if (x.profId === profId) conflitos.push(`${fmtData(d)}: o professor já tem aula às ${x.hora}.`);
        if (x.alunoId === alunoId) conflitos.push(`${fmtData(d)}: o aluno já tem aula às ${x.hora}.`);
      });
      if (prof && !dentroDisp(prof, n)) fora.push(fmtData(d));
    });
    return { conflitos, fora };
  }, [datas, hora, duracao, db.aulas, profId, alunoId, prof]);
  const bloqueia = !prof || !alunoId || analise.conflitos.length > 0 || (analise.fora.length > 0 && !forcar);
  const salvar = () => {
    const serieId = fixa ? `f${Date.now()}` : undefined;
    criarAulas(datas.map((d, i) => ({ id: `a${Date.now()}${i}`, profId, alunoId, materia: mat, data: d, hora, duracao, status: "agendada", serieId })));
    onClose();
  };
  return (
    <Modal onClose={onClose}>
      <h2>Nova aula</h2>
      <p className="muted small">Lembrete: confirme com o professor (WhatsApp) antes de agendar. Ter horário livre não significa estar livre.</p>
      <div className="grid g2">
        <label className="f">Professor<select className="in" value={profId} onChange={(e) => { setProfId(e.target.value); setMateria(""); }}>{profs.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
        <label className="f">Aluno<select className="in" value={alunoId} onChange={(e) => setAlunoId(e.target.value)}>{db.alunos.filter((a) => a.pacote === "ativo").map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}</select></label>
        <label className="f">Matéria<select className="in" value={mat} onChange={(e) => setMateria(e.target.value)}>{prof?.materias.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label className="f">Duração<select className="in" value={duracao} onChange={(e) => setDuracao(Number(e.target.value) as Duracao)}>{DURACOES.map((d) => <option key={d} value={d}>{durLabel(d)}{prof ? ` · professor recebe ${brl(prof.valores[d])}` : ""}</option>)}</select></label>
        <label className="f">Data<input className="in" type="date" value={data} onChange={(e) => setData(e.target.value)} /></label>
        <label className="f">Horário<input className="in" type="time" step={1800} value={hora} onChange={(e) => setHora(e.target.value)} /></label>
      </div>
      <label className="row small" style={{ marginBottom: 12 }}><input type="checkbox" checked={fixa} onChange={(e) => setFixa(e.target.checked)} /> <b>Aula fixa</b> (repete toda semana)
        {fixa && <span className="row">por <input className="in" style={{ width: 70 }} type="number" min={2} max={26} value={semanas} onChange={(e) => setSemanas(Math.max(2, Number(e.target.value)))} /> semanas</span>}</label>
      {analise.conflitos.map((c) => <div key={c} className="alert bad">⛔ {c}</div>)}
      {analise.fora.length > 0 && <div className="alert warn">⚠️ Fora da disponibilidade informada pelo professor em: {analise.fora.join(", ")}.
        <label className="row" style={{ marginTop: 6 }}><input type="checkbox" checked={forcar} onChange={(e) => setForcar(e.target.checked)} /> Já confirmei com o professor, agendar mesmo assim</label></div>}
      {!analise.conflitos.length && !analise.fora.length && prof && <div className="alert ok">✅ Sem conflitos. Horário dentro da disponibilidade do professor.</div>}
      <div className="row" style={{ justifyContent: "flex-end" }}><button className="btn ghost" onClick={onClose}>Fechar</button><button className="btn" disabled={bloqueia} onClick={salvar}>{fixa ? `Agendar ${semanas} aulas` : "Agendar aula"}</button></div>
    </Modal>
  );
}

export function DetalheAula({ id, onClose, admin }: { id: string; onClose: () => void; admin: boolean }) {
  const { db, cancelarAula, reagendarAula, salvarAula, verificarRelatorio } = useApp();
  const a = db.aulas.find((x) => x.id === id);
  const [modo, setModo] = useState<"ver" | "cancelar" | "reagendar">("ver");
  const [motivo, setMotivo] = useState(""); const [noPrazo, setNoPrazo] = useState(horasAte(a ?? { data: iso(new Date()), hora: "00:00" }) >= 4);
  const [nd, setNd] = useState(a?.data ?? ""); const [nh, setNh] = useState(a?.hora ?? "");
  if (!a) return null;
  const p = db.professores.find((x) => x.id === a.profId); const al = db.alunos.find((x) => x.id === a.alunoId);
  const conflito = db.aulas.some((x) => x.id !== a.id && ativa(x) && sobrepoe({ data: nd, hora: nh, duracao: a.duracao }, x) && (x.profId === a.profId || x.alunoId === a.alunoId));
  return (
    <Modal onClose={onClose}>
      <div className="row" style={{ marginBottom: 6 }}><h2 className="grow" style={{ margin: 0 }}>{a.materia}</h2><StatusPill s={a.status} /></div>
      <p className="muted">{fmtData(a.data)} · {a.hora} às {fimAula(a)} ({durLabel(a.duracao)}){a.serieId && <> · <span className="pill gray">Aula fixa</span></>}</p>
      <div className="grid g2" style={{ marginBottom: 12 }}>
        <div><div className="muted small">Professor</div><b>{p?.nome}</b></div><div><div className="muted small">Aluno</div><b>{al?.nome}</b></div>
        <div><div className="muted small">Responsável</div><b>{al?.responsavel}</b></div><div><div className="muted small">Valor do professor</div><b>{brl(valorAula(p, a))}</b></div>
      </div>
      {a.status === "cancelada_tardia" && <div className="alert bad">Cancelada fora do prazo de 4h. O responsável deve pagar a aula integralmente ao curso (não ao professor).</div>}
      {a.motivo && a.status !== "cancelada_tardia" && <p className="small muted">Motivo: {a.motivo}</p>}
      {a.relatorio && <div className="card" style={{ background: "var(--bg)", boxShadow: "none", marginBottom: 12 }}>
        <h3>Relatório da aula {a.relatorio.verificado ? <span className="pill ok">Conferido</span> : <span className="pill warn">A conferir</span>}</h3>
        <p className="small"><b>Conteúdo:</b> {a.relatorio.conteudo}</p><p className="small" style={{ margin: 0 }}><b>Atividade:</b> {a.relatorio.atividade || "Nenhuma"}</p></div>}
      {modo === "cancelar" && (<div className="card" style={{ boxShadow: "none", marginBottom: 12 }}>
        <label className="f">Motivo<input className="in" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: aluno doente" /></label>
        <label className="row small"><input type="checkbox" checked={noPrazo} onChange={(e) => setNoPrazo(e.target.checked)} /> O responsável avisou com <b>4h ou mais</b> de antecedência</label>
        {!noPrazo && <div className="alert warn" style={{ marginTop: 10 }}>Fora do prazo: a aula será cobrada integralmente do responsável, em favor do curso.</div>}
        <div className="row" style={{ marginTop: 10 }}><button className="btn bad" onClick={() => { cancelarAula(a.id, motivo, noPrazo); onClose(); }}>Confirmar cancelamento</button><button className="btn ghost" onClick={() => setModo("ver")}>Voltar</button></div></div>)}
      {modo === "reagendar" && (<div className="card" style={{ boxShadow: "none", marginBottom: 12 }}>
        <div className="grid g2"><label className="f">Nova data<input className="in" type="date" value={nd} onChange={(e) => setNd(e.target.value)} /></label>
          <label className="f">Novo horário<input className="in" type="time" step={1800} value={nh} onChange={(e) => setNh(e.target.value)} /></label></div>
        {conflito && <div className="alert bad">Conflito com outra aula do professor ou do aluno.</div>}
        {p && !dentroDisp(p, { data: nd, hora: nh, duracao: a.duracao }) && <div className="alert warn">Fora da disponibilidade informada pelo professor.</div>}
        <div className="row"><button className="btn" disabled={conflito} onClick={() => { reagendarAula(a.id, nd, nh); onClose(); }}>Confirmar</button><button className="btn ghost" onClick={() => setModo("ver")}>Voltar</button></div></div>)}
      <div className="row" style={{ justifyContent: "flex-end" }}>
        {admin && a.status === "agendada" && modo === "ver" && (<>
          <button className="btn bad" onClick={() => setModo("cancelar")}>Cancelar</button>
          <button className="btn sec" onClick={() => setModo("reagendar")}>Reagendar</button>
          <button className="btn sec" onClick={() => { salvarAula({ ...a, status: "realizada" }); onClose(); }}>Registrar como realizada</button></>)}
        {admin && a.relatorio && !a.relatorio.verificado && <button className="btn" onClick={() => { verificarRelatorio(a.id); onClose(); }}>Marcar relatório como conferido</button>}
        <button className="btn ghost" onClick={onClose}>Fechar</button>
      </div>
    </Modal>
  );
}
