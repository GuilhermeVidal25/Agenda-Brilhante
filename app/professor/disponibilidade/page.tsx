"use client";
import { useProf } from "@/lib/useProf";
import { DIAS } from "@/lib/util";
const HORAS = Array.from({ length: 15 }, (_, i) => i + 7);
const ORDEM = [1, 2, 3, 4, 5, 6, 0];
export default function Disp() {
  const { prof, atualizarProf } = useProf();
  if (!prof) return null;
  const tog = (k: string) => atualizarProf(prof.id, { disp: prof.disp.includes(k) ? prof.disp.filter((x) => x !== k) : [...prof.disp, k] });
  return (<>
    <div className="top"><div className="grow"><h1>Disponibilidade</h1><p className="muted">Marque os horários em que você <b>pode</b> dar aula. A administração confirma cada aula com você antes de agendar.</p></div></div>
    <div className="card"><div className="dispgrid"><div />{ORDEM.map((d) => <div className="h" key={d}>{DIAS[d]}</div>)}
      {HORAS.map((h) => (<><div className="l" key={`l${h}`}>{h}h</div>{ORDEM.map((d) => { const k = `${d}-${h}`; return <button key={k} aria-label={`${DIAS[d]} ${h}h`} className={`cell ${prof.disp.includes(k) ? "on" : ""}`} onClick={() => tog(k)} />; })}</>))}</div>
      <p className="small muted" style={{ marginTop: 12 }}>Salvo automaticamente. {prof.disp.length} horas marcadas por semana.</p></div>
  </>);
}
