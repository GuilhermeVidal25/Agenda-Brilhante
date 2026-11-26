"use client";
import type { Aula, StatusAula } from "@/lib/types";
export function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="modal">{children}</div></div>;
}
export const StatusPill = ({ s }: { s: StatusAula }) => {
  const m = { agendada: ["Agendada", ""], realizada: ["Realizada", "ok"], cancelada: ["Cancelada", "gray"], cancelada_tardia: ["Cancelada fora do prazo", "bad"] }[s];
  return <span className={`pill ${m[1]}`}>{m[0]}</span>;
};
export const Kpi = ({ t, v, sub }: { t: string; v: string | number; sub?: string }) => (
  <div className="card kpi"><small>{t}</small><b>{v}</b>{sub && <div className="muted small" style={{ marginTop: 4 }}>{sub}</div>}</div>);
export type { Aula };
