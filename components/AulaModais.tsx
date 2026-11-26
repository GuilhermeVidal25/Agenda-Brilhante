"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import type { Aula, Duracao } from "@/lib/types";
import { DURACOES, brl, dentroDisp, durLabel, fimAula, fmtData, horasAte, inicioAula, iso, parseISO, addDays, sobrepoe, valorAula } from "@/lib/util";
import { Icon } from "./Icon";
import { Alert, Modal, ModalHead, StatusPill, corProf } from "./ui";

const ativa = (a: Aula) => a.status === "agendada" || a.status === "realizada";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const dataLonga = (s: string) => cap(parseISO(s).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }));
const faltam = (h: number) => { const m = Math.max(0, Math.round(h * 60)); return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}` : `${m} min`; };

export function NovaAula({ onClose, inicial }: { onClose: () => void; inicial?: { data?: string; profId?: string; hora?: string } }) {
  const { db, criarAulas } = useApp();
  const profs = db.professores.filter((p) => p.status === "ativo");
  const [profId, setProfId] = useState(inicial?.profId ?? profs[0]?.id ?? "");
  const [alunoId, setAlunoId] = useState(db.alunos.find((a) => a.pacote === "ativo")?.id ?? "");
  const prof = profs.find((p) => p.id === profId);
  const [materia, setMateria] = useState("");
  const [data, setData] = useState(inicial?.data ?? iso(new Date()));
  const [hora, setHora] = useState(inicial?.hora ?? "15:00");
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
  const primeiro = prof?.nome.split(" ")[0] ?? "o professor";
  const diaSemana = parseISO(data).toLocaleDateString("pt-BR", { weekday: "long" });
  return (
    <Modal onClose={onClose} label="Nova aula">
      <ModalHead title="Nova aula" sub="Confirme com o professor pelo WhatsApp antes de agendar. Horário livre não significa disponível." onClose={onClose} />
      <div className="m-body">
        <div className="form-grid">
          <label className="field"><span className="label">Professor</span>
            <select className="in" value={profId} onChange={(e) => { setProfId(e.target.value); setMateria(""); setForcar(false); }}>{profs.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
          <label className="field"><span className="label">Aluno</span>
            <select className="in" value={alunoId} onChange={(e) => setAlunoId(e.target.value)}>{db.alunos.filter((a) => a.pacote === "ativo").map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}</select></label>
          <label className="field"><span className="label">Matéria</span>
            <select className="in" value={mat} onChange={(e) => setMateria(e.target.value)}>{prof?.materias.map((m) => <option key={m}>{m}</option>)}</select></label>
          <div className="field">
            <span className="label" id="l-dur">Duração</span>
            <div className="seg" role="radiogroup" aria-labelledby="l-dur">
              {DURACOES.map((d) => <button key={d} type="button" role="radio" aria-checked={duracao === d} onClick={() => setDuracao(d)}>{durLabel(d)}</button>)}
            </div>
            {prof && <span className="hint">{primeiro} recebe {brl(prof.valores[duracao])} por esta aula</span>}
          </div>
          <label className="field"><span className="label">Data</span><input className="in" type="date" value={data} onChange={(e) => { setData(e.target.value); setForcar(false); }} /></label>
          <label className="field"><span className="label">Horário de início</span>
            <input className={`in ${analise.conflitos.length ? "err" : ""}`} type="time" step={1800} value={hora} onChange={(e) => { setHora(e.target.value); setForcar(false); }} aria-invalid={analise.conflitos.length > 0} />
            <span className="hint">Termina às {fimAula({ hora, duracao })}</span></label>
        </div>
        <div className="toggle-row">
          <button type="button" className="switch" role="switch" aria-checked={fixa} aria-labelledby="l-fixa" onClick={() => setFixa(!fixa)} />
          <div className="grow" style={{ display: "flex", flexDirection: "column" }}><b id="l-fixa">Aula fixa</b><span className="small muted">Repete toda {diaSemana}, no mesmo horário.</span></div>
          {fixa && <label className="row small" style={{ color: "var(--ink-700)" }}>por <input className="in" style={{ width: 72, height: 36 }} type="number" min={2} max={26} value={semanas} onChange={(e) => setSemanas(Math.min(26, Math.max(2, Number(e.target.value))))} aria-label="Número de semanas" /> semanas</label>}
        </div>
        {analise.conflitos.length > 0 && <Alert kind="bad"><span><b>Conflito de horário.</b> Escolha outro horário.</span>{analise.conflitos.map((c) => <span key={c}>{c}</span>)}</Alert>}
        {!analise.conflitos.length && analise.fora.length > 0 && (
          <Alert kind="warn"><span><b>Fora da disponibilidade de {primeiro}</b> em: {analise.fora.join(", ")}.</span>
            <label className="check" style={{ color: "#3B2A10" }}><input type="checkbox" checked={forcar} onChange={(e) => setForcar(e.target.checked)} />Já confirmei com o professor. Agendar mesmo assim.</label></Alert>)}
        {!analise.conflitos.length && !analise.fora.length && prof && <Alert kind="ok">{fixa ? `Os ${semanas} horários estão livres e dentro da disponibilidade de ${primeiro}.` : `Horário livre e dentro da disponibilidade de ${primeiro}.`}</Alert>}
      </div>
      <div className="m-foot">
        <span className="small muted grow hide-m">{primeiro} recebe o e-mail de confirmação ao agendar.</span>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn" disabled={bloqueia} onClick={salvar}>{fixa ? `Agendar ${semanas} aulas` : "Agendar aula"}</button>
      </div>
    </Modal>
  );
}

export function DetalheAula({ id, onClose, admin }: { id: string; onClose: () => void; admin: boolean }) {
  const { db, cancelarAula, reagendarAula, salvarAula, verificarRelatorio } = useApp();
  const a = db.aulas.find((x) => x.id === id);
  const [modo, setModo] = useState<"ver" | "cancelar" | "reagendar">("ver");
  const [motivo, setMotivo] = useState("");
  const h = a ? horasAte(a) : 0;
  const [noPrazo, setNoPrazo] = useState(h >= 4);
  const [nd, setNd] = useState(a?.data ?? ""); const [nh, setNh] = useState(a?.hora ?? "");
  if (!a) return null;
  const p = db.professores.find((x) => x.id === a.profId); const al = db.alunos.find((x) => x.id === a.alunoId);
  const cor = corProf(db.professores, a.profId);
  const conflito = db.aulas.some((x) => x.id !== a.id && ativa(x) && sobrepoe({ data: nd, hora: nh, duracao: a.duracao }, x) && (x.profId === a.profId || x.alunoId === a.alunoId));
  const foraDisp = p && !dentroDisp(p, { data: nd, hora: nh, duracao: a.duracao });
  const cancelada = a.status === "cancelada" || a.status === "cancelada_tardia";
  const terminou = +inicioAula(a) + a.duracao * 60000 < Date.now();
  const relPendente = a.status === "agendada" && terminou && !a.relatorio;
  const emBreve = a.status === "agendada" && h > 0 && h < 4;
  const podeAgir = admin && a.status === "agendada" && modo === "ver";
  const podeConferir = admin && a.relatorio && !a.relatorio.verificado && modo === "ver";
  return (
    <Modal onClose={onClose} variant="drawer" label={`Aula de ${a.materia}`}>
      <div className="m-head">
        <div className="titles">
          <div className="row" style={{ gap: 6 }}><StatusPill s={a.status} />{a.serieId && <span className="chip outline"><Icon name="repeat" size={12} stroke={2} />Aula fixa</span>}</div>
          <h2 style={{ marginTop: 6, textDecoration: cancelada ? "line-through" : undefined }}>{a.materia}</h2>
          <span style={{ color: "var(--ink-700)" }}>{dataLonga(a.data)}</span>
          <b>{a.hora} às {fimAula(a)} · {durLabel(a.duracao)}</b>
          {emBreve && modo === "ver" && <span className="small row" style={{ color: "var(--warn)", gap: 6, marginTop: 4, flexWrap: "nowrap", alignItems: "flex-start" }}><Icon name="clock" size={15} style={{ flex: "none", marginTop: 2 }} />Começa em {faltam(h)}. Cancelar agora fica fora do prazo de 4h.</span>}
        </div>
        <button className="btn ghost icon" aria-label="Fechar detalhes" onClick={onClose}><Icon name="x" /></button>
      </div>
      <div className="m-sec" style={{ marginTop: 16, borderTop: "1px solid var(--line-soft)" }}>
        <div className="kv-grid">
          <div className="kv"><div className="k">Professor</div><div className="v row" style={{ gap: 8 }}><span className="dot" style={{ background: cor.c }} />{p?.nome}</div></div>
          <div className="kv"><div className="k">Aluno</div><div className="v">{al?.nome}</div></div>
          <div className="kv"><div className="k">Responsável</div><div className="v">{al?.responsavel}</div></div>
          <div className="kv"><div className="k">Valor ao professor</div><div className="v">{cancelada ? <span className="muted" style={{ fontWeight: 400 }}>Não se aplica</span> : brl(valorAula(p, a))}</div></div>
        </div>
      </div>
      <div className="m-body" style={{ flex: 1 }}>
        {a.status === "cancelada_tardia" && <Alert kind="warn">Cancelada fora do prazo de 4h. O responsável paga a aula integralmente ao curso, não ao professor.</Alert>}
        {a.motivo && <div className="kv"><div className="k">Motivo do cancelamento</div><div>{a.motivo}</div></div>}
        {relPendente && <Alert kind="warn" icon="filePend">A aula já terminou e o relatório ainda não foi enviado pelo professor.{admin ? " Você pode registrar a aula como realizada mesmo assim." : ""}</Alert>}
        {a.relatorio && (
          <div className="stack" style={{ gap: 10 }}>
            <div className="row"><h3 className="grow">Relatório da aula</h3>{a.relatorio.verificado ? <span className="chip ok">Conferido</span> : <span className="chip warn">A conferir</span>}</div>
            <div className="box">
              <div className="kv"><div className="k">Conteúdo trabalhado</div><div>{a.relatorio.conteudo}</div></div>
              <div className="kv"><div className="k">Atividade deixada</div><div>{a.relatorio.atividade || "Nenhuma"}</div></div>
              <span className="xs muted">Enviado em {new Date(a.relatorio.enviadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}. O responsável recebeu por e-mail.</span>
            </div>
          </div>)}
        {modo === "cancelar" && (
          <div className="subform">
            <h3>Cancelar esta aula</h3>
            <label className="field"><span className="label">Motivo</span><input className="in" data-autofocus value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: aluno doente" /></label>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <legend className="label" style={{ padding: 0, marginBottom: 6 }}>Quando o responsável avisou?</legend>
              <label className={`opt-card ${noPrazo ? "on" : ""}`}><input type="radio" name="prazo" checked={noPrazo} onChange={() => setNoPrazo(true)} /><span><b>Com 4h ou mais de antecedência</b><br /><span className="small muted">Nada é cobrado. Só esta aula é cancelada.</span></span></label>
              <label className={`opt-card ${!noPrazo ? "on" : ""}`}><input type="radio" name="prazo" checked={!noPrazo} onChange={() => setNoPrazo(false)} /><span><b>Com menos de 4h (fora do prazo)</b><br /><span className="small muted">O responsável paga a aula integral ao curso.</span></span></label>
            </fieldset>
            <span className="xs muted">{h > 0 ? `Sugerido pelo sistema: a aula começa em ${faltam(h)}.` : "A aula já começou ou passou."} O professor recebe um e-mail ao confirmar.</span>
            <div className="row"><button className="btn danger-solid" onClick={() => { cancelarAula(a.id, motivo, noPrazo); onClose(); }}>Confirmar cancelamento</button><button className="btn ghost" onClick={() => setModo("ver")}>Voltar</button></div>
          </div>)}
        {modo === "reagendar" && (
          <div className="subform">
            <h3>Reagendar</h3>
            <div className="form-grid">
              <label className="field"><span className="label">Nova data</span><input className="in" data-autofocus type="date" value={nd} onChange={(e) => setNd(e.target.value)} /></label>
              <label className="field"><span className="label">Novo horário</span><input className={`in ${conflito ? "err" : ""}`} type="time" step={1800} value={nh} onChange={(e) => setNh(e.target.value)} /></label>
            </div>
            {conflito ? <Alert kind="bad">Conflito com outra aula do professor ou do aluno.</Alert>
              : foraDisp ? <Alert kind="warn">Fora da disponibilidade informada por {p?.nome.split(" ")[0]}. Confirme com o professor antes.</Alert>
              : <Alert kind="ok">Sem conflitos e dentro da disponibilidade.</Alert>}
            <div className="row"><button className="btn" disabled={conflito} onClick={() => { reagendarAula(a.id, nd, nh); onClose(); }}>Confirmar novo horário</button><button className="btn ghost" onClick={() => setModo("ver")}>Voltar</button></div>
          </div>)}
      </div>
      {(podeAgir || podeConferir) && (
        <div className="m-foot">
          {podeAgir && (<>
            <button className="btn" onClick={() => { salvarAula({ ...a, status: "realizada" }); onClose(); }}>Registrar como realizada</button>
            <button className="btn sec" onClick={() => setModo("reagendar")}>Reagendar</button>
            <span className="grow hide-m" />
            <button className="btn danger" onClick={() => setModo("cancelar")}>Cancelar aula</button></>)}
          {podeConferir && <button className="btn" onClick={() => { verificarRelatorio(a.id); onClose(); }}>Marcar relatório como conferido</button>}
        </div>)}
    </Modal>
  );
}
