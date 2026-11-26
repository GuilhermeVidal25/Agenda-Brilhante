export type Duracao = 60 | 90 | 120;
export type StatusProf = "pendente" | "ativo" | "inativo";
export type StatusAula = "agendada" | "realizada" | "cancelada" | "cancelada_tardia";

export interface Professor {
  id: string; nome: string; email: string; materias: string[];
  valores: Record<Duracao, number>; // valor pago por duração
  status: StatusProf; pix: string;
  disp: string[]; // "dia-hora", ex.: "1-14" = segunda 14h (dia 0 = domingo)
}
export interface Aluno {
  id: string; nome: string; responsavel: string; emailResp: string; pacote: "ativo" | "suspenso";
}
export interface Relatorio { conteudo: string; atividade: string; enviadoEm: string; verificado: boolean; }
export interface Aula {
  id: string; profId: string; alunoId: string; materia: string;
  data: string; hora: string; duracao: Duracao; status: StatusAula;
  serieId?: string; motivo?: string; relatorio?: Relatorio;
}
export interface Email { id: string; para: string; assunto: string; corpo: string; quando: string; }
export interface Db { professores: Professor[]; alunos: Aluno[]; aulas: Aula[]; emails: Email[]; }
export type Sessao = { papel: "admin"; nome: string } | { papel: "professor"; profId: string } | null;
