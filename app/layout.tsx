import "./globals.css";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { Provider } from "@/lib/store";
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex", display: "swap" });
export const metadata: Metadata = { title: "Agenda Brilhante", description: "Agenda de aulas, relatórios e pagamentos de professores do Curso Brilhante." };
export const viewport: Viewport = { themeColor: "#2A2FA3", width: "device-width", initialScale: 1 };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="pt-BR" className={plex.variable}><body><Provider>{children}</Provider></body></html>);
}
