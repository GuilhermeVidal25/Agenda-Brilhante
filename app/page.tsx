"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Avatar, corProf } from "@/components/ui";
import { useApp } from "@/lib/store";

export default function Entrada() {
  const { db, pronto, entrar, resetar } = useApp();
  const router = useRouter();
  if (!pronto) return <div className="login muted" role="status">Carregando…</div>;
  return (
    <div className="login"><div className="login-wrap">
      <section className="login-intro">
        <div className="brand" style={{ padding: 0 }}><span className="brand-mark" style={{ width: 34, height: 34, fontSize: 17 }} aria-hidden="true">A</span><b style={{ fontWeight: 700, fontSize: 17 }}>Agenda Brilhante</b></div>
        <div className="stack" style={{ gap: 12 }}>
          <h1>Todas as aulas do Curso Brilhante num só lugar.</h1>
          <p className="lead">Agenda sem conflito, relatório de cada aula direto para o responsável e o pagamento dos professores calculado sozinho.</p>
        </div>
        <ol className="steps">
          {["A administração agenda e confirma a aula.", "O professor recebe o aviso por e-mail.", "Ao final, ele envia o relatório da aula.", "Responsável e administração são notificados."].map((t, i) => (
            <li key={t}><i>{i + 1}</i><span>{t}</span></li>))}
        </ol>
      </section>
      <section className="panel login-card" aria-labelledby="t-entrar">
        <div className="stack" style={{ gap: 6 }}>
          <div className="row"><h2 id="t-entrar" className="grow" style={{ fontSize: 20, lineHeight: "26px" }}>Entrar</h2><span className="chip brand">Demonstração</span></div>
          <p className="small muted">Escolha um perfil para navegar. Em produção, o acesso será por e-mail e senha.</p>
        </div>
        <div className="stack" style={{ gap: 4 }}>
          <span className="xs muted" style={{ fontWeight: 500, padding: "0 12px 4px" }}>Administração</span>
          <button className="persona" onClick={() => { entrar({ papel: "admin", nome: "Guilherme" }); router.push("/admin"); }}>
            <Avatar nome="Guilherme" lg /><span className="who-txt"><b>Guilherme</b><span>Agenda, professores e pagamentos</span></span><Icon name="right" size={16} style={{ color: "var(--ink-400)" }} />
          </button>
        </div>
        <div className="stack" style={{ gap: 4 }}>
          <span className="xs muted" style={{ fontWeight: 500, padding: "0 12px 4px" }}>Professores</span>
          {db.professores.map((p) => (
            <button key={p.id} className="persona" onClick={() => { entrar({ papel: "professor", profId: p.id }); router.push("/professor"); }}>
              <Avatar nome={p.nome} lg cor={p.status === "ativo" ? corProf(db.professores, p.id) : { c: "var(--ink-600)", bg: "var(--line-soft)" }} />
              <span className="who-txt"><b>{p.nome}</b><span>{p.materias.join(", ") || "Sem matérias"}</span></span>
              {p.status === "pendente" ? <span className="chip warn">Aguardando aprovação</span> : <Icon name="right" size={16} style={{ color: "var(--ink-400)" }} />}
            </button>))}
        </div>
        <div className="row" style={{ paddingTop: 16, borderTop: "1px solid var(--line-soft)", flexWrap: "nowrap" }}>
          <Link href="/cadastro" className="btn sec grow">Sou professor, quero me cadastrar</Link>
          <button className="btn ghost" onClick={resetar} title="Volta aos dados iniciais" aria-label="Restaurar demo"><Icon name="refresh" size={16} /><span className="hide-m">Restaurar demo</span></button>
        </div>
      </section>
    </div></div>
  );
}
