import type { Aula, Duracao, Professor } from "./types";
export const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const DURACOES: Duracao[] = [60, 90, 120];
export const durLabel = (d: number) => (d === 60 ? "1h" : d === 90 ? "1h30" : "2h");
export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parseISO = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const startOfWeek = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
export const fmtData = (s: string) => parseISO(s).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
export const toMin = (h: string) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
export const fromMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const fimAula = (a: Pick<Aula, "hora" | "duracao">) => fromMin(toMin(a.hora) + a.duracao);
export const inicioAula = (a: Pick<Aula, "data" | "hora">) => { const d = parseISO(a.data); d.setMinutes(toMin(a.hora)); return d; };
export const horasAte = (a: Pick<Aula, "data" | "hora">, now = new Date()) => (inicioAula(a).getTime() - now.getTime()) / 3600000;
export const sobrepoe = (a: Pick<Aula, "data" | "hora" | "duracao">, b: Pick<Aula, "data" | "hora" | "duracao">) =>
  a.data === b.data && toMin(a.hora) < toMin(b.hora) + b.duracao && toMin(b.hora) < toMin(a.hora) + a.duracao;
export const valorAula = (p: Professor | undefined, a: Aula) => (p ? p.valores[a.duracao] : 0);
// professor está disponível quando todas as horas cheias cobertas pela aula estão marcadas
export function dentroDisp(p: Professor, a: Pick<Aula, "data" | "hora" | "duracao">) {
  const dow = parseISO(a.data).getDay();
  const ini = toMin(a.hora), fim = ini + a.duracao;
  for (let h = Math.floor(ini / 60); h * 60 < fim; h++) if (!p.disp.includes(`${dow}-${h}`)) return false;
  return true;
}
export const STATUS_LABEL: Record<string, string> = {
  agendada: "Agendada", realizada: "Realizada", cancelada: "Cancelada", cancelada_tardia: "Cancelada (fora do prazo)",
};
