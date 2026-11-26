"use client";
import { useEffect, useRef } from "react";
import type { Aula, Professor, StatusAula } from "@/lib/types";
import { Icon } from "./Icon";

/* Diálogo acessível: Esc fecha, foco fica preso dentro, volta ao elemento de origem ao fechar.
   variant "drawer" = gaveta à direita no desktop; no celular os dois viram folha que sobe da base. */
export function Modal({ children, onClose, variant = "center", narrow, label }: {
  children: React.ReactNode; onClose: () => void; variant?: "center" | "drawer"; narrow?: boolean; label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const focusables = () => Array.from(el?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])') ?? []);
    (el?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0])?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); close.current(); return; }
      if (e.key !== "Tab") return;
      const f = focusables(); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    const ov = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ov; prev?.focus?.(); };
  }, []);
  return (
    <div className={`overlay ${variant === "drawer" ? "drawer" : ""}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`modal ${narrow ? "narrow" : ""}`} role="dialog" aria-modal="true" aria-label={label}>
        <span className="sheet-grip" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

export function ModalHead({ title, sub, onClose, children }: { title: React.ReactNode; sub?: React.ReactNode; onClose: () => void; children?: React.ReactNode }) {
  return (
    <div className="m-head">
      <div className="titles">{children}<h2>{title}</h2>{sub && <p className="small muted">{sub}</p>}</div>
      <button className="btn ghost icon" aria-label="Fechar" onClick={onClose}><Icon name="x" /></button>
    </div>
  );
}

export const STATUS_TXT: Record<StatusAula, string> = { agendada: "Agendada", realizada: "Realizada", cancelada: "Cancelada", cancelada_tardia: "Cancelada fora do prazo" };
export const StatusPill = ({ s }: { s: StatusAula }) => (
  <span className={`chip ${s}`}>{s === "realizada" && <Icon name="check" size={12} stroke={2.5} />}{STATUS_TXT[s]}</span>
);

export const Stat = ({ k, v, s, attn, hero }: { k: string; v: React.ReactNode; s?: React.ReactNode; attn?: boolean; hero?: boolean }) => (
  <div className={`stat ${attn ? "attn" : ""} ${hero ? "hero" : ""}`}><span className="k">{k}</span><span className="v">{v}</span>{s && <span className="s">{s}</span>}</div>
);

const ALERT_ICON = { info: "info", ok: "check", warn: "alert", bad: "ban" } as const;
export function Alert({ kind, children, icon, role }: { kind: "info" | "ok" | "warn" | "bad"; children: React.ReactNode; icon?: string; role?: "alert" | "status" }) {
  return (
    <div className={`alert ${kind}`} role={role ?? (kind === "bad" || kind === "warn" ? "alert" : "status")}>
      <Icon name={icon ?? ALERT_ICON[kind]} stroke={kind === "ok" ? 2.25 : 1.75} />
      <div className="alert-body">{children}</div>
    </div>
  );
}

export function PageHead({ title, sub, overline, children }: { title: string; sub?: React.ReactNode; overline?: string; children?: React.ReactNode }) {
  return (
    <header className="page-head">
      <div className="titles">{overline && <span className="overline">{overline}</span>}<h1>{title}</h1>{sub && <p className="muted">{sub}</p>}</div>
      {children}
    </header>
  );
}

export function Empty({ icon, title, children, action }: { icon: string; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-icon"><Icon name={icon} size={22} /></span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

/* Cor de identificação do professor na agenda (ciclo de 6). Só visual: o status nunca depende dela. */
export const PROF_CORES = [
  { c: "#0F6F76", bg: "#E3F2F3", bd: "#AFD8DB" },
  { c: "#7E3A8C", bg: "#F4E9F6", bd: "#DCC0E2" },
  { c: "#1D5FA8", bg: "#E6EFFA", bd: "#BAD1EE" },
  { c: "#55651B", bg: "#EEF2DF", bd: "#CFD8AE" },
  { c: "#44507A", bg: "#E9ECF5", bd: "#C7CDE2" },
  { c: "#9B2F66", bg: "#F8E6EF", bd: "#E8C0D3" },
];
export const corProf = (profs: Professor[], id: string) => PROF_CORES[Math.max(0, profs.findIndex((p) => p.id === id)) % PROF_CORES.length];
export const iniciais = (nome: string) => nome.split(" ").filter(Boolean).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
export const Avatar = ({ nome, cor, lg }: { nome: string; cor?: { c: string; bg: string }; lg?: boolean }) => (
  <span className={`avatar ${lg ? "lg" : ""}`} style={cor ? { background: cor.bg, color: cor.c } : undefined} aria-hidden="true">{iniciais(nome)}</span>
);

export const DateBox = ({ d, today }: { d: Date; today?: boolean }) => (
  <span className={`date-box ${today ? "today" : ""}`}>
    <span>{today ? "hoje" : d.toLocaleDateString("pt-BR", { weekday: "short" })}</span><b>{d.getDate()}</b>
  </span>
);

export type { Aula };
