"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/lib/store";

const ADMIN = [
  { href: "/admin", ic: "🏠", t: "Início" }, { href: "/admin/agenda", ic: "🗓️", t: "Agenda" },
  { href: "/admin/professores", ic: "🎓", t: "Professores" }, { href: "/admin/alunos", ic: "👥", t: "Alunos" },
  { href: "/admin/pagamentos", ic: "💰", t: "Pagamentos" }, { href: "/admin/emails", ic: "✉️", t: "E-mails" },
];
const PROF = [
  { href: "/professor", ic: "🏠", t: "Início" }, { href: "/professor/aulas", ic: "📝", t: "Minhas aulas" },
  { href: "/professor/disponibilidade", ic: "⏰", t: "Disponibilidade" }, { href: "/professor/perfil", ic: "👤", t: "Perfil" },
];

export default function Shell({ papel, children }: { papel: "admin" | "professor"; children: React.ReactNode }) {
  const { sessao, pronto, db, sair, toast } = useApp();
  const path = usePathname(); const router = useRouter();
  useEffect(() => { if (pronto && (!sessao || sessao.papel !== papel)) router.replace("/"); }, [pronto, sessao, papel, router]);
  if (!pronto || !sessao || sessao.papel !== papel) return <div className="login muted">Carregando…</div>;
  const prof = sessao.papel === "professor" ? db.professores.find((p) => p.id === sessao.profId) : null;
  if (papel === "professor" && prof && prof.status !== "ativo") {
    return (<div className="login"><div className="card" style={{ maxWidth: 460, textAlign: "center" }}>
      <div style={{ fontSize: 44 }}>⏳</div><h1>Cadastro em análise</h1>
      <p className="muted">Olá, {prof.nome.split(" ")[0]}! Seu cadastro foi recebido. Você poderá entrar assim que a administração aprovar e avisar por e-mail.</p>
      <button className="btn ghost" onClick={() => { sair(); router.replace("/"); }}>Voltar</button></div></div>);
  }
  const items = papel === "admin" ? ADMIN : PROF;
  const pend = db.professores.filter((p) => p.status === "pendente").length;
  const on = (h: string) => (h === "/admin" || h === "/professor" ? path === h : path.startsWith(h));
  const nome = sessao.papel === "admin" ? sessao.nome : prof?.nome ?? "";
  return (
    <div className="app">
      <aside className="side">
        <div className="logo"><i>A</i>Agenda Brilhante</div>
        {items.map((i) => (<Link key={i.href} href={i.href} className={`nav ${on(i.href) ? "on" : ""}`}><b>{i.ic}</b>{i.t}{i.href === "/admin/professores" && pend > 0 && <span className="badge">{pend}</span>}</Link>))}
        <div className="spacer" />
        <div className="user"><b>{nome}</b><div className="muted">{papel === "admin" ? "Administrador" : "Professor"}</div>
          <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => { sair(); router.replace("/"); }}>Sair</button></div>
      </aside>
      <main className="main">{children}</main>
      <nav className="tabbar">{items.slice(0, 5).map((i) => (<Link key={i.href} href={i.href} className={on(i.href) ? "on" : ""}><b>{i.ic}</b>{i.t}</Link>))}
        <a onClick={() => { sair(); router.replace("/"); }}><b>🚪</b>Sair</a></nav>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
