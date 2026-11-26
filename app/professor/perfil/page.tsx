"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Alert, PageHead } from "@/components/ui";
import { useProf } from "@/lib/useProf";
export default function Perfil() {
  const { prof, atualizarProf, enviarEmail, sair } = useProf();
  const router = useRouter();
  const [f, setF] = useState(() => ({ nome: prof?.nome ?? "", email: prof?.email ?? "", pix: prof?.pix ?? "" }));
  const [salvo, setSalvo] = useState(false);
  if (!prof) return null;
  const mudou = f.nome !== prof.nome || f.email !== prof.email || f.pix !== prof.pix;
  const set = (k: keyof typeof f, v: string) => { setF({ ...f, [k]: v }); setSalvo(false); };
  return (<div className="main-inner" style={{ maxWidth: 640 }}>
    <PageHead title="Meu perfil" sub="Dados usados pelo financeiro para o seu pagamento." />
    <form className="panel pad stack" onSubmit={(e) => { e.preventDefault(); atualizarProf(prof.id, f); setSalvo(true); }}>
      <label className="field"><span className="label">Nome completo</span><input className="in" autoComplete="name" value={f.nome} onChange={(e) => set("nome", e.target.value)} /></label>
      <label className="field"><span className="label">E-mail</span><input className="in" type="email" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></label>
      <label className="field"><span className="label">Chave Pix</span><input className="in" value={f.pix} onChange={(e) => set("pix", e.target.value)} placeholder="CPF, e-mail, telefone ou chave aleatória" />
        {!f.pix && <span className="hint">Sem a chave Pix o financeiro não consegue pagar você.</span>}</label>
      {salvo && <Alert kind="ok">Dados salvos.</Alert>}
      <div className="row" style={{ paddingTop: 4 }}>
        <button className="btn" type="submit" disabled={!mudou}>Salvar dados</button>
        <button className="btn sec" type="button" onClick={() => enviarEmail(prof.email, "Redefinição de senha", "Use o link enviado para criar uma nova senha (simulação).")}><Icon name="key" />Alterar senha</button>
      </div>
    </form>
    <button className="btn danger only-m" onClick={() => { sair(); router.replace("/"); }}><Icon name="logout" />Sair da conta</button>
  </div>);
}
