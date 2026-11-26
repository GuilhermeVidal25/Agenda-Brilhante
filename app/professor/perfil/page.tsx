"use client";
import { useState } from "react";
import { useProf } from "@/lib/useProf";
export default function Perfil() {
  const { prof, atualizarProf, enviarEmail } = useProf();
  const [f, setF] = useState(() => ({ nome: prof?.nome ?? "", email: prof?.email ?? "", pix: prof?.pix ?? "" }));
  const [msg, setMsg] = useState("");
  if (!prof) return null;
  return (<>
    <div className="top"><div className="grow"><h1>Meu perfil</h1><p className="muted">Dados usados pelo financeiro para o seu pagamento.</p></div></div>
    <div className="card" style={{ maxWidth: 560 }}>
      <label className="f">Nome completo<input className="in" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></label>
      <label className="f">E-mail<input className="in" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      <label className="f">Chave Pix<input className="in" value={f.pix} onChange={(e) => setF({ ...f, pix: e.target.value })} placeholder="CPF, e-mail, telefone ou chave aleatória" /></label>
      <div className="row"><button className="btn" onClick={() => { atualizarProf(prof.id, f); setMsg("Dados salvos."); }}>Salvar dados</button>
        <button className="btn ghost" onClick={() => enviarEmail(prof.email, "Redefinição de senha", "Use o link enviado para criar uma nova senha (simulação).")}>Alterar senha</button></div>
      {msg && <p className="small" style={{ color: "var(--ok)", marginTop: 10 }}>{msg}</p>}
    </div>
  </>);
}
