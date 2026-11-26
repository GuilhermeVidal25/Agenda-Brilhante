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
    <div className="login"><div className="card" style={{ width: "min(480px,100%)" }}>
      <div className="logo" style={{ padding: "0 0 14px" }}><i>A</i>Agenda Brilhante</div>
      <h1>Cadastro de professor</h1>
      <p className="muted">Preencha seus dados. O acesso só é liberado depois que a administração aprovar e avisar por e-mail.</p>
      <form onSubmit={(e) => { e.preventDefault(); const id = cadastrarProf({ nome, email, materias: mat.split(",").map((s) => s.trim()).filter(Boolean) }); entrar({ papel: "professor", profId: id }); router.push("/professor"); }}>
        <label className="f">Nome completo<input className="in" required value={nome} onChange={(e) => setNome(e.target.value)} /></label>
        <label className="f">E-mail<input className="in" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="f">Matérias que leciona (separe por vírgula)<input className="in" required placeholder="Ex.: Matemática, Física" value={mat} onChange={(e) => setMat(e.target.value)} /></label>
        <div className="row"><button className="btn grow">Enviar cadastro</button><Link href="/" className="btn ghost">Voltar</Link></div>
      </form>
    </div></div>
  );
}
