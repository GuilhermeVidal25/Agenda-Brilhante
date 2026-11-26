"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Aula, Db, Email, Professor, Relatorio, Sessao } from "./types";
import { buildSeed } from "./seed";
import { brl, durLabel, fmtData, fimAula, horasAte } from "./util";

const KEY_DB = "agenda-brilhante:db:v1";
const KEY_SES = "agenda-brilhante:sessao:v1";

interface Ctx {
  db: Db; pronto: boolean; sessao: Sessao; toast: string | null;
  entrar: (s: Sessao) => void; sair: () => void; resetar: () => void;
  enviarEmail: (para: string, assunto: string, corpo: string) => void;
  salvarAula: (a: Aula) => void; criarAulas: (a: Aula[]) => void;
  cancelarAula: (id: string, motivo: string, avisouNoPrazo?: boolean) => { tardia: boolean };
  reagendarAula: (id: string, data: string, hora: string) => void;
  enviarRelatorio: (id: string, r: Omit<Relatorio, "enviadoEm" | "verificado">) => void;
  verificarRelatorio: (id: string) => void;
  atualizarProf: (id: string, p: Partial<Professor>) => void;
  aprovarProf: (id: string) => void; cadastrarProf: (p: Pick<Professor, "nome" | "email" | "materias">) => string;
  adicionarAluno: (nome: string, responsavel: string, emailResp: string) => void;
  alternarPacote: (alunoId: string) => number;
}
const C = createContext<Ctx | null>(null);
export const useApp = () => { const c = useContext(C); if (!c) throw new Error("fora do provider"); return c; };

const vazio: Db = { professores: [], alunos: [], aulas: [], emails: [] };
let seq = 0;
const uid = (p: string) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

export function Provider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Db>(vazio);
  const [pronto, setPronto] = useState(false);
  const [sessao, setSessao] = useState<Sessao>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY_DB);
      const base: Db = raw ? JSON.parse(raw) : buildSeed();
      // mantém a aula de demonstração da regra das 4h sempre ~2h à frente
      const demo = base.aulas.find((a) => a.id === "demo-hoje");
      if (demo && demo.status === "agendada" && horasAte(demo) < 1) {
        const f = buildSeed().aulas.find((a) => a.id === "demo-hoje");
        base.aulas = base.aulas.filter((a) => a.id !== "demo-hoje").concat(f ? [f] : []);
      }
      setDb(base);
      const s = localStorage.getItem(KEY_SES);
      if (s) setSessao(JSON.parse(s));
    } catch { setDb(buildSeed()); }
    setPronto(true);
  }, []);
  useEffect(() => { if (pronto) try { localStorage.setItem(KEY_DB, JSON.stringify(db)); } catch {} }, [db, pronto]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4200); return () => clearTimeout(t); } }, [toast]);

  const nota = useCallback((m: string) => setToast(m), []);
  const mailsPara = useCallback((lista: Omit<Email, "id" | "quando">[]) => {
    setDb((d) => ({ ...d, emails: [...lista.map((e) => ({ ...e, id: uid("e"), quando: new Date().toISOString() })), ...d.emails] }));
  }, []);
  const enviarEmail = useCallback((para: string, assunto: string, corpo: string) => { mailsPara([{ para, assunto, corpo }]); nota(`E-mail enviado para ${para}: ${assunto}`); }, [mailsPara, nota]);

  const val = useMemo<Ctx>(() => {
    const profDe = (id: string) => db.professores.find((p) => p.id === id);
    const alunoDe = (id: string) => db.alunos.find((a) => a.id === id);
    const desc = (a: Aula) => `${a.materia}, ${fmtData(a.data)} das ${a.hora} às ${fimAula(a)} (${durLabel(a.duracao)})`;
    return {
      db, pronto, sessao, toast,
      entrar: (s) => { setSessao(s); try { localStorage.setItem(KEY_SES, JSON.stringify(s)); } catch {} },
      sair: () => { setSessao(null); try { localStorage.removeItem(KEY_SES); } catch {} },
      resetar: () => { setDb(buildSeed()); nota("Dados de demonstração restaurados."); },
      enviarEmail,
      salvarAula: (a) => setDb((d) => ({ ...d, aulas: d.aulas.map((x) => (x.id === a.id ? a : x)) })),
      criarAulas: (novas) => {
        setDb((d) => ({ ...d, aulas: [...d.aulas, ...novas] }));
        const a = novas[0]; const p = profDe(a.profId); const al = alunoDe(a.alunoId);
        if (p) enviarEmail(p.email, "Aula confirmada", `Olá, ${p.nome}. Confirmamos ${novas.length > 1 ? `${novas.length} aulas semanais, a primeira: ` : "a aula: "}${desc(a)} com ${al?.nome}.`);
      },
      cancelarAula: (id, motivo, avisouNoPrazo) => {
        const a = db.aulas.find((x) => x.id === id)!;
        const tardia = avisouNoPrazo === undefined ? horasAte(a) < 4 : !avisouNoPrazo;
        setDb((d) => ({ ...d, aulas: d.aulas.map((x) => (x.id === id ? { ...x, status: tardia ? "cancelada_tardia" : "cancelada", motivo } : x)) }));
        const p = profDe(a.profId);
        if (p) enviarEmail(p.email, "Aula cancelada", `A aula ${desc(a)} foi cancelada. ${motivo ? "Motivo: " + motivo : ""}`);
        return { tardia };
      },
      reagendarAula: (id, data, hora) => {
        const a = db.aulas.find((x) => x.id === id)!;
        setDb((d) => ({ ...d, aulas: d.aulas.map((x) => (x.id === id ? { ...x, data, hora } : x)) }));
        const p = profDe(a.profId);
        if (p) enviarEmail(p.email, "Aula reagendada", `A aula de ${a.materia} foi movida para ${fmtData(data)} às ${hora}.`);
      },
      enviarRelatorio: (id, r) => {
        const a = db.aulas.find((x) => x.id === id)!;
        const p = profDe(a.profId); const al = alunoDe(a.alunoId);
        setDb((d) => ({ ...d, aulas: d.aulas.map((x) => (x.id === id ? { ...x, status: "realizada", relatorio: { ...r, enviadoEm: new Date().toISOString(), verificado: false } } : x)) }));
        const corpo = `Conteúdo: ${r.conteudo}\nAtividade para o aluno: ${r.atividade || "nenhuma"}`;
        mailsPara([
          { para: p!.email, assunto: "Aula registrada como ministrada", corpo: `Recebemos seu relatório da aula ${desc(a)}.` },
          { para: "administracao@cursobrilhante.demo", assunto: `Relatório de aula: ${p!.nome}`, corpo: `${desc(a)} com ${al?.nome}.\n${corpo}` },
          { para: al!.emailResp, assunto: `Relatório da aula de ${a.materia}`, corpo: `Olá, ${al!.responsavel}. Aula de ${al!.nome} realizada em ${fmtData(a.data)}.\n${corpo}` },
        ]);
        nota("Relatório enviado. Professor, administração e responsável foram notificados (simulação).");
      },
      verificarRelatorio: (id) => setDb((d) => ({ ...d, aulas: d.aulas.map((x) => (x.id === id && x.relatorio ? { ...x, relatorio: { ...x.relatorio, verificado: true } } : x)) })),
      atualizarProf: (id, p) => setDb((d) => ({ ...d, professores: d.professores.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      aprovarProf: (id) => {
        const p = profDe(id)!;
        setDb((d) => ({ ...d, professores: d.professores.map((x) => (x.id === id ? { ...x, status: "ativo" } : x)) }));
        enviarEmail(p.email, "Seu acesso foi liberado", `Olá, ${p.nome}! Seu cadastro foi aprovado. Já é possível entrar na plataforma.`);
      },
      cadastrarProf: (p) => {
        const id = uid("p");
        setDb((d) => ({ ...d, professores: [...d.professores, { id, ...p, valores: { 60: 50, 90: 75, 120: 100 }, status: "pendente", pix: "", disp: [] }] }));
        mailsPara([{ para: "administracao@cursobrilhante.demo", assunto: "Novo cadastro de professor", corpo: `${p.nome} (${p.email}) aguarda aprovação.` }]);
        return id;
      },
      adicionarAluno: (nome, responsavel, emailResp) => setDb((d) => ({ ...d, alunos: [...d.alunos, { id: uid("a"), nome, responsavel, emailResp, pacote: "ativo" }] })),
      alternarPacote: (alunoId) => {
        const al = alunoDe(alunoId)!; let n = 0;
        const suspender = al.pacote === "ativo";
        setDb((d) => ({
          ...d,
          alunos: d.alunos.map((x) => (x.id === alunoId ? { ...x, pacote: suspender ? "suspenso" : "ativo" } : x)),
          aulas: suspender ? d.aulas.map((x) => { if (x.alunoId === alunoId && x.status === "agendada" && horasAte(x) > 0) { n++; return { ...x, status: "cancelada", motivo: "Pacote suspenso" }; } return x; }) : d.aulas,
        }));
        nota(suspender ? `Pacote suspenso. Aulas futuras canceladas.` : "Pacote reativado.");
        return n;
      },
    };
  }, [db, pronto, sessao, toast, enviarEmail, mailsPara, nota]);

  return <C.Provider value={val}>{children}</C.Provider>;
}
void brl;
