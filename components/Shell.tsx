"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Icon } from "./Icon";
import { Avatar } from "./ui";

type Item = { href: string; ic: string; t: string; curto?: string; grupo?: string };
const ADMIN: Item[] = [
  { href: "/admin", ic: "home", t: "Início", grupo: "Operação" },
  { href: "/admin/agenda", ic: "calendar", t: "Agenda" },
  { href: "/admin/professores", ic: "cap", t: "Professores" },
  { href: "/admin/alunos", ic: "users", t: "Alunos" },
  { href: "/admin/pagamentos", ic: "money", t: "Pagamentos", grupo: "Gestão" },
  { href: "/admin/emails", ic: "mail", t: "E-mails enviados", curto: "E-mails" },
];
const PROF: Item[] = [
  { href: "/professor", ic: "home", t: "Início" },
  { href: "/professor/aulas", ic: "calendar", t: "Minhas aulas", curto: "Aulas" },
  { href: "/professor/disponibilidade", ic: "clock", t: "Disponibilidade", curto: "Horários" },
  { href: "/professor/perfil", ic: "user", t: "Meu perfil", curto: "Perfil" },
];

export default function Shell({ papel, children }: { papel: "admin" | "professor"; children: React.ReactNode }) {
  const { sessao, pronto, db, sair, toast } = useApp();
  const path = usePathname(); const router = useRouter();
  const [mais, setMais] = useState(false);
  useEffect(() => { if (pronto && (!sessao || sessao.papel !== papel)) router.replace("/"); }, [pronto, sessao, papel, router]);
  useEffect(() => { setMais(false); }, [path]);
  if (!pronto || !sessao || sessao.papel !== papel) return <div className="login muted" role="status">Carregando…</div>;
  const prof = sessao.papel === "professor" ? db.professores.find((p) => p.id === sessao.profId) : null;
  const logout = () => { sair(); router.replace("/"); };
  if (papel === "professor" && prof && prof.status !== "ativo") {
    return (
      <div className="login"><div className="panel center-card" style={{ alignItems: "center", textAlign: "center" }}>
        <span className="empty-icon" style={{ background: "var(--warn-bg)", color: "var(--warn)" }}><Icon name="clock" size={22} /></span>
        <h1 style={{ fontSize: 24, lineHeight: "30px" }}>Cadastro em análise</h1>
        <p className="muted">Olá, {prof.nome.split(" ")[0]}! Recebemos seu cadastro. Você poderá entrar assim que a administração aprovar e avisar por e-mail.</p>
        <button className="btn sec" onClick={logout}>Voltar ao início</button>
      </div></div>
    );
  }
  const items = papel === "admin" ? ADMIN : PROF;
  const pend = db.professores.filter((p) => p.status === "pendente").length;
  const on = (h: string) => (h === "/admin" || h === "/professor" ? path === h : path.startsWith(h));
  const nome = sessao.papel === "admin" ? sessao.nome : prof?.nome ?? "";
  const badge = (h: string) => h === "/admin/professores" && pend > 0;
  const tabs = papel === "admin" ? items.slice(0, 4) : items;
  const extra = papel === "admin" ? items.slice(4) : [];
  return (
    <div className="app">
      <aside className="side">
        <div className="brand"><span className="brand-mark" aria-hidden="true">A</span><span className="brand-name"><b>Agenda Brilhante</b><span>Curso Brilhante</span></span></div>
        <nav aria-label="Principal" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map((i) => (<div key={i.href} style={{ display: "contents" }}>
            {i.grupo && <span className="nav-group">{i.grupo}</span>}
            <Link href={i.href} className={`nav ${on(i.href) ? "on" : ""}`} aria-current={on(i.href) ? "page" : undefined} title={i.t}>
              <Icon name={i.ic} /><span className="nav-label">{i.t}</span>
              {badge(i.href) && <><span className="count" aria-label={`${pend} aguardando aprovação`}>{pend}</span><span className="count-dot" aria-hidden="true" /></>}
            </Link>
          </div>))}
        </nav>
        <div style={{ flex: 1 }} />
        <div className="user">
          <Avatar nome={nome} />
          <div className="user-txt grow" style={{ display: "flex", flexDirection: "column" }}><b className="small">{nome}</b><span className="xs muted">{papel === "admin" ? "Administrador" : "Professor"}</span></div>
          <button className="btn ghost icon" aria-label="Sair" title="Sair" onClick={logout}><Icon name="logout" /></button>
        </div>
      </aside>
      <main className="main">{children}</main>
      <nav className="tabbar" aria-label="Principal">
        {tabs.map((i) => (
          <Link key={i.href} href={i.href} className={`tab ${on(i.href) ? "on" : ""}`} aria-current={on(i.href) ? "page" : undefined}>
            <Icon name={i.ic} size={22} stroke={on(i.href) ? 1.9 : 1.75} /><span>{i.curto ?? i.t}</span>
            {badge(i.href) && <span className="count-dot" aria-label={`${pend} aguardando aprovação`} />}
          </Link>))}
        {papel === "admin" && (
          <button className={`tab ${extra.some((i) => on(i.href)) ? "on" : ""}`} aria-expanded={mais} aria-haspopup="menu" onClick={() => setMais(!mais)}>
            <Icon name="more" size={22} /><span>Mais</span>
          </button>)}
      </nav>
      {mais && (<>
        <div style={{ position: "fixed", inset: 0, zIndex: 44 }} onClick={() => setMais(false)} aria-hidden="true" />
        <div className="more-menu" role="menu">
          {extra.map((i) => <Link key={i.href} href={i.href} role="menuitem"><Icon name={i.ic} />{i.t}</Link>)}
          <button role="menuitem" onClick={logout}><Icon name="logout" />Sair</button>
        </div>
      </>)}
      {toast && <div className="toast" role="status" aria-live="polite"><Icon name="check" stroke={2.25} /><span>{toast}</span></div>}
    </div>
  );
}
