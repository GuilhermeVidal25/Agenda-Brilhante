"use client";
import Link from "next/link";
import { brl, detalhe, resumoProf } from "@/components/Pagamento";
import { Icon } from "@/components/Icon";
import { Alert, DateBox, PageHead } from "@/components/ui";
import { useProf } from "@/lib/useProf";
import { durLabel, fimAula, fmtData, inicioAula, iso, parseISO } from "@/lib/util";

const saudacao = () => { const h = new Date().getHours(); return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"; };

export default function Inicio() {
  const { db, prof } = useProf();
  if (!prof) return null;
  const mes = new Date().toISOString().slice(0, 7);
  const r = resumoProf(prof, db.aulas, mes);
  const minhas = db.aulas.filter((a) => a.profId === prof.id);
  const prox = minhas.filter((a) => a.status === "agendada" && +inicioAula(a) + a.duracao * 60000 >= Date.now()).sort((a, b) => +inicioAula(a) - +inicioAula(b)).slice(0, 5);
  const semRel = minhas.filter((a) => a.status === "agendada" && +inicioAula(a) + a.duracao * 60000 < Date.now());
  const hoje = iso(new Date());
  const [primeira, ...resto] = prox;
  const nomeA = (id: string) => db.alunos.find((x) => x.id === id)?.nome ?? "";
  const mesNome = new Date().toLocaleDateString("pt-BR", { month: "long" });
  const em = primeira ? Math.round((+inicioAula(primeira) - Date.now()) / 60000) : 0;
  const emTxt = em > 0 && em < 24 * 60 ? `Começa em ${em >= 60 ? `${Math.floor(em / 60)}h${em % 60 ? String(em % 60).padStart(2, "0") : ""}` : `${em} min`}` : em <= 0 && primeira ? "Em andamento" : null;
  const dataHoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }).replace(/^./, (c) => c.toUpperCase());
  return (<div className="main-inner" style={{ maxWidth: 960 }}>
    <PageHead overline={dataHoje} title={`${saudacao()}, ${prof.nome.split(" ")[0]}`} />

    <div className="split">
      <div className="main-col stack" style={{ gap: 20 }}>
        <section className="panel" aria-label="Pagamento do mês">
          <div className="stat hero" style={{ padding: "18px 20px 14px" }}>
            <span className="k">A receber em {mesNome}</span><span className="v">{brl(r.total)}</span>
            <span className="small" style={{ color: "var(--ink-600)" }}>{r.feitas} {r.feitas === 1 ? "aula realizada" : "aulas realizadas"}{r.feitas ? ` · ${detalhe(r)}` : ""}</span>
          </div>
          <div className="panel-foot small muted row" style={{ flexWrap: "nowrap" }}><Icon name="calendar" size={16} />{r.previstas} {r.previstas === 1 ? "aula prevista" : "aulas previstas"} até o fim do mês</div>
        </section>

        {semRel.length > 0 && (
          <Alert kind="warn" icon="filePend">
            <span><b>{semRel.length} {semRel.length === 1 ? "aula sem relatório" : "aulas sem relatório"}.</b> {semRel.length === 1 ? `${semRel[0].materia} com ${nomeA(semRel[0].alunoId).split(" ")[0]}, ${fmtData(semRel[0].data)}. ` : ""}O responsável só recebe depois do envio.</span>
            <span><Link className="btn" href="/professor/aulas" style={{ color: "#fff" }}>Enviar relatório</Link></span>
          </Alert>)}
        {!prof.pix && <Alert kind="warn" icon="key"><span><b>Informe sua chave Pix</b> para receber os pagamentos. <Link href="/professor/perfil">Completar perfil</Link></span></Alert>}

        <section aria-labelledby="h-prox" className="stack" style={{ gap: 10 }}>
          <h2 id="h-prox">Próxima aula</h2>
          {!primeira ? <div className="panel"><div className="empty" style={{ padding: 28 }}><span className="empty-icon"><Icon name="calendar" size={22} /></span><p>Sem aulas agendadas. A administração avisa por e-mail quando marcar uma.</p></div></div> : (
            <div className="panel" style={{ padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 64, flex: "none", display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", borderRadius: 10, background: "var(--brand-50)", color: "var(--brand)" }}>
                <span className="xs" style={{ fontWeight: 600, textTransform: "uppercase" }}>{primeira.data === hoje ? "Hoje" : parseISO(primeira.data).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" })}</span>
                <span style={{ fontSize: 18, lineHeight: "24px", fontWeight: 600 }}>{primeira.hora}</span>
              </div>
              <div className="grow stack" style={{ gap: 0 }}>
                <b style={{ fontSize: 16 }}>{primeira.materia}</b>
                <span className="small" style={{ color: "var(--ink-600)" }}>{nomeA(primeira.alunoId)} · {durLabel(primeira.duracao)}, até {fimAula(primeira)}</span>
                {emTxt && <span className="small" style={{ color: "var(--warn)", fontWeight: 500, marginTop: 2 }}>{emTxt}</span>}
              </div>
            </div>)}
        </section>
      </div>

      <section className="side-col" aria-labelledby="h-dep">
        <div className="panel" style={{ overflow: "hidden" }}>
          <div className="panel-head"><h2 id="h-dep">Depois</h2><Link href="/professor/aulas" className="small" style={{ fontWeight: 600 }}>Ver todas</Link></div>
          {resto.length === 0 && <p className="small muted" style={{ padding: "0 20px 16px" }}>Nenhuma outra aula agendada.</p>}
          {resto.map((a) => (<div key={a.id} className="list-row">
            <DateBox d={parseISO(a.data)} today={a.data === hoje} />
            <span className="what"><b>{a.materia}</b><span>{nomeA(a.alunoId)} · {a.hora} às {fimAula(a)}</span></span>
            {a.serieId && <Icon name="repeat" size={15} stroke={2} label="Aula fixa" style={{ color: "var(--muted)" }} />}
          </div>))}
        </div>
      </section>
    </div>
  </div>);
}
