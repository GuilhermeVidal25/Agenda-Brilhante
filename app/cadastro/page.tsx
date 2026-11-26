"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/lib/store";

export default function Cadastro() {
  const { cadastrarProf, entrar, pronto } = useApp();
  const router = useRouter();
  const [nome, setNome] = useState(""); const [email, setEmail] = useState(""); const [mat, setMat] = useState("");
  if (!pronto) return null;
  return (
    <div className="login"><div className="panel center-card" style={{ boxShadow: "var(--shadow-float)", borderRadius: "var(--r-xl)" }}>
      <div className="brand" style={{ padding: 0 }}><span className="brand-mark" aria-hidden="true">A</span><b style={{ fontWeight: 700 }}>Agenda Brilhante</b></div>
      <div className="stack" style={{ gap: 6 }}>
        <h1 style={{ fontSize: 24, lineHeight: "30px" }}>Cadastro de professor</h1>
        <p className="muted">Preencha seus dados. O acesso só é liberado depois que a administração aprovar e avisar por e-mail.</p>
      </div>
      <form className="stack" onSubmit={(e) => { e.preventDefault(); const id = cadastrarProf({ nome, email, materias: mat.split(",").map((s) => s.trim()).filter(Boolean) }); entrar({ papel: "professor", profId: id }); router.push("/professor"); }}>
        <label className="field"><span className="label">Nome completo</span><input className="in" required autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} /></label>
        <label className="field"><span className="label">E-mail</span><input className="in" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="field"><span className="label">Matérias que leciona</span><input className="in" required placeholder="Ex.: Matemática, Física" value={mat} onChange={(e) => setMat(e.target.value)} /><span className="hint">Separe as matérias por vírgula.</span></label>
        <div className="row" style={{ marginTop: 4 }}><button className="btn grow" type="submit">Enviar cadastro</button><Link href="/" className="btn ghost">Voltar</Link></div>
      </form>
    </div></div>
  );
}
