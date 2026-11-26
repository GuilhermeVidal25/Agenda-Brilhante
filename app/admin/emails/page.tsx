"use client";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Empty, PageHead } from "@/components/ui";
import { useApp } from "@/lib/store";
export default function Emails() {
  const { db } = useApp();
  return (<div className="main-inner" style={{ maxWidth: 880 }}>
    <PageHead title="E-mails enviados" sub="Na demonstração, os e-mails ficam registrados aqui. Em produção, o envio será pelo Brevo." />
    <section className="panel" aria-label="E-mails" style={{ overflow: "hidden" }}>
      {db.emails.length === 0 ? (
        <Empty icon="mail" title="Nenhum e-mail enviado ainda" action={<Link href="/admin/agenda" className="btn sec">Abrir agenda</Link>}>Os avisos aparecem aqui quando você agenda, cancela ou aprova um professor.</Empty>
      ) : db.emails.map((e) => (
        <article key={e.id} className="mail">
          <span className="attn-icon brand"><Icon name="mail" /></span>
          <div className="grow stack" style={{ gap: 4 }}>
            <div className="row" style={{ alignItems: "baseline" }}><b className="grow">{e.assunto}</b><time className="xs muted" dateTime={e.quando}>{new Date(e.quando).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time></div>
            <span className="small muted">Para: {e.para}</span>
            <p className="small" style={{ whiteSpace: "pre-line", color: "var(--ink-700)" }}>{e.corpo}</p>
          </div>
        </article>))}
    </section>
  </div>);
}
