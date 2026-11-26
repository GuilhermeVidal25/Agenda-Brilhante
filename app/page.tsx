"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export default function Entrada() {
  const { db, pronto, entrar, resetar } = useApp();
  const router = useRouter();
  if (!pronto) return <div className="login muted">Carregando…</div>;
  return (
    <div className="login"><div className="wrap">
      <div className="hero">
        <div className="logo" style={{ color: "#fff", padding: 0, marginBottom: 28 }}><i style={{ background: "#fff", color: "#2A2FA3" }}>A</i>Agenda Brilhante</div>
        <h1>Todas as aulas do Curso Brilhante num só lugar.</h1>
        <p>Agenda sem conflito, relatório de cada aula direto para o responsável e o pagamento dos professores calculado sozinho.</p>
        <div className="steps" style={{ marginTop: 26 }}>
          {["A administração agenda e confirma a aula.", "O professor recebe o aviso por e-mail.", "Ao final, ele envia o relatório da aula.", "Responsável e administração são notificados."].map((t, i) => (
            <div className="step" key={t}><i style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}>{i + 1}</i><span style={{ paddingTop: 5 }}>{t}</span></div>))}
        </div>
      </div>
      <div className="card">
        <h2>Entrar (modo demonstração)</h2>
        <p className="muted small">Escolha um perfil para navegar. Em produção, o acesso será por e-mail e senha.</p>
        <button className="persona" onClick={() => { entrar({ papel: "admin", nome: "Guilherme" }); router.push("/admin"); }}>
          <span className="avatar">G</span><span><b>Guilherme</b><br /><span className="muted small">Administrador · agenda, professores e pagamentos</span></span></button>
        <p className="small muted" style={{ margin: "14px 0 8px", fontWeight: 700 }}>PROFESSORES</p>
        {db.professores.map((p) => (
          <button key={p.id} className="persona" onClick={() => { entrar({ papel: "professor", profId: p.id }); router.push("/professor"); }}>
            <span className="avatar">{p.nome[0]}</span>
            <span style={{ flex: 1 }}><b>{p.nome}</b><br /><span className="muted small">{p.materias.join(", ") || "—"}</span></span>
            {p.status === "pendente" && <span className="pill warn">Aguardando aprovação</span>}
          </button>))}
        <div className="row" style={{ marginTop: 8 }}>
          <Link href="/cadastro" className="btn sec grow">Sou professor, quero me cadastrar</Link>
          <button className="btn ghost sm" onClick={resetar}>Restaurar demo</button>
        </div>
      </div>
    </div></div>
  );
}
