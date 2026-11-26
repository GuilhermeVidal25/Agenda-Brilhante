"use client";
import { useApp } from "@/lib/store";
export default function Emails() {
  const { db } = useApp();
  return (<>
    <div className="top"><div className="grow"><h1>Caixa de e-mails</h1><p className="muted">Na demonstração, os e-mails ficam registrados aqui. Em produção, o envio será pelo Brevo.</p></div></div>
    {db.emails.length === 0 && <div className="card muted">Nenhum e-mail ainda. Agende uma aula, cancele ou aprove um professor para ver os envios.</div>}
    <div className="grid">{db.emails.map((e) => (<div key={e.id} className="card"><div className="row"><b className="grow">{e.assunto}</b><span className="muted small">{new Date(e.quando).toLocaleString("pt-BR")}</span></div>
      <div className="small muted" style={{ margin: "2px 0 8px" }}>Para: {e.para}</div><p className="small" style={{ whiteSpace: "pre-line", margin: 0 }}>{e.corpo}</p></div>))}</div>
  </>);
}
