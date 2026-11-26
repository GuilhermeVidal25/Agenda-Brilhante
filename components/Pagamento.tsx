import type { Aula, Professor } from "@/lib/types";
import { DURACOES, brl, durLabel } from "@/lib/util";
export function resumoProf(p: Professor, aulas: Aula[], mes: string) {
  const mine = aulas.filter((a) => a.profId === p.id && a.data.startsWith(mes));
  const feitas = mine.filter((a) => a.status === "realizada");
  const porDur = DURACOES.map((d) => ({ d, n: feitas.filter((a) => a.duracao === d).length }));
  return { feitas: feitas.length, porDur, total: feitas.reduce((s, a) => s + p.valores[a.duracao], 0), tardias: mine.filter((a) => a.status === "cancelada_tardia").length, previstas: mine.filter((a) => a.status === "agendada").length };
}
export const detalhe = (r: ReturnType<typeof resumoProf>) => r.porDur.filter((x) => x.n).map((x) => `${x.n}× ${durLabel(x.d)}`).join(" · ") || "—";
export { brl };
