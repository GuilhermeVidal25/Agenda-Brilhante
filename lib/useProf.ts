"use client";
import { useApp } from "./store";
export function useProf() {
  const app = useApp();
  const prof = app.sessao?.papel === "professor" ? app.db.professores.find((p) => p.id === (app.sessao as { profId: string }).profId) : undefined;
  return { ...app, prof };
}
