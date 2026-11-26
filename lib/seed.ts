import type { Aula, Db, Professor, Aluno } from "./types";
import { addDays, fromMin, iso, startOfWeek } from "./util";

const slots = (dias: number[], de: number, ate: number) => dias.flatMap((d) => Array.from({ length: ate - de }, (_, i) => `${d}-${de + i}`));

const professores: Professor[] = [
  { id: "p1", nome: "Marina Albuquerque", email: "marina@cursobrilhante.demo", materias: ["Matemática", "Física"], valores: { 60: 55, 90: 82.5, 120: 110 }, status: "ativo", pix: "marina@pix.demo", disp: slots([1, 2, 3, 4, 5], 14, 20) },
  { id: "p2", nome: "Carlos Mendes", email: "carlos@cursobrilhante.demo", materias: ["Redação", "Português"], valores: { 60: 50, 90: 75, 120: 100 }, status: "ativo", pix: "11122233344", disp: [...slots([1, 3, 5], 8, 12), ...slots([2, 4], 18, 21)] },
  { id: "p3", nome: "Beatriz Lima", email: "beatriz@cursobrilhante.demo", materias: ["Química", "Biologia"], valores: { 60: 60, 90: 90, 120: 120 }, status: "ativo", pix: "beatriz@pix.demo", disp: slots([1, 2, 3, 4], 15, 21) },
  { id: "p4", nome: "Rafael Torres", email: "rafael@cursobrilhante.demo", materias: ["História", "Geografia"], valores: { 60: 50, 90: 75, 120: 100 }, status: "pendente", pix: "", disp: [] },
];
const alunos: Aluno[] = [
  { id: "a1", nome: "Lucas Ferreira", responsavel: "Sônia Ferreira", emailResp: "sonia@exemplo.demo", pacote: "ativo" },
  { id: "a2", nome: "Ana Clara Souza", responsavel: "Paulo Souza", emailResp: "paulo@exemplo.demo", pacote: "ativo" },
  { id: "a3", nome: "Pedro Henrique Dias", responsavel: "Marta Dias", emailResp: "marta@exemplo.demo", pacote: "ativo" },
  { id: "a4", nome: "Júlia Martins", responsavel: "Roberto Martins", emailResp: "roberto@exemplo.demo", pacote: "ativo" },
];

export function buildSeed(now = new Date()): Db {
  const seg = startOfWeek(now);
  const d = (n: number) => iso(addDays(seg, n));
  let k = 0;
  const A = (profId: string, alunoId: string, materia: string, dia: number, hora: string, duracao: 60 | 90 | 120, extra: Partial<Aula> = {}): Aula =>
    ({ id: `s${++k}`, profId, alunoId, materia, data: d(dia), hora, duracao, status: "agendada", ...extra });
  const rel = (conteudo: string, atividade: string, verificado = false) => ({ conteudo, atividade, enviadoEm: new Date().toISOString(), verificado });
  const aulas: Aula[] = [
    // semana passada (apuração do mês)
    A("p1", "a1", "Matemática", -6, "15:00", 60, { status: "realizada", relatorio: rel("Funções do 2º grau.", "Lista 3.", true) }),
    A("p2", "a2", "Redação", -5, "09:00", 90, { status: "realizada", relatorio: rel("Estrutura dissertativa.", "Redação sobre mobilidade urbana.", true) }),
    A("p3", "a3", "Química", -4, "16:00", 120, { status: "realizada", relatorio: rel("Estequiometria.", "Exercícios 10 a 20.", true) }),
    // esta semana
    A("p1", "a1", "Matemática", 0, "15:00", 60, { serieId: "f1", status: "realizada", relatorio: rel("Geometria plana: áreas.", "Lista 4 (questões 1 a 10).", false) }),
    A("p2", "a2", "Redação", 1, "18:00", 90, { serieId: "f2", status: "cancelada", motivo: "Aviso do responsável com 1 dia de antecedência." }),
    A("p3", "a3", "Biologia", 2, "16:00", 90, { serieId: "f3" }),
    A("p1", "a4", "Física", 3, "15:00", 60, { serieId: "f4" }),
    A("p1", "a1", "Matemática", 4, "15:00", 60, { serieId: "f1" }),
    A("p2", "a2", "Redação", 3, "18:00", 90, { serieId: "f2" }),
    A("p3", "a3", "Química", 4, "16:00", 120),
    // próxima semana
    A("p1", "a1", "Matemática", 7, "15:00", 60, { serieId: "f1" }),
    A("p2", "a2", "Redação", 8, "18:00", 90, { serieId: "f2" }),
    A("p3", "a3", "Biologia", 9, "16:00", 90, { serieId: "f3" }),
  ];
  // aula de demonstração que começa em ~2h para testar a regra das 4h
  const soon = new Date(now.getTime() + 2 * 3600000);
  const min = Math.ceil((soon.getHours() * 60 + soon.getMinutes()) / 30) * 30;
  if (min < 24 * 60 - 60) aulas.push({ id: "demo-hoje", profId: "p3", alunoId: "a4", materia: "Química", data: iso(now), hora: fromMin(min), duracao: 60, status: "agendada" });
  return { professores, alunos, aulas, emails: [] };
}
