import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Provider } from "@/lib/store";
export const metadata: Metadata = { title: "Agenda Brilhante", description: "Agenda de aulas, relatórios e pagamentos de professores do Curso Brilhante." };
export const viewport: Viewport = { themeColor: "#2A2FA3", width: "device-width", initialScale: 1 };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="pt-BR"><body><Provider>{children}</Provider></body></html>);
}
