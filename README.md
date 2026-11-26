# Agenda Brilhante

Agenda de aulas particulares do **Curso Brilhante**: disponibilidade dos professores, agendamento sem conflito, relatório pós-aula enviado ao responsável e apuração do pagamento de cada professor.

> **Versão atual: protótipo navegável (MVP de demonstração).** Os dados ficam no navegador (localStorage) e os e-mails são simulados na tela "E-mails". A próxima etapa troca isso por Supabase (banco e login) e Brevo (e-mails reais).

## Funcionalidades
| Funcionalidade | Dor que resolve |
|---|---|
| Agenda semanal (aulas fixas e avulsas) com alerta de conflito, só pela administração | Retrabalho de conferir horários no WhatsApp |
| Disponibilidade semanal do professor | Não saber quem pode dar aula |
| Cadastro do professor com aprovação e e-mail de liberação | Controle de acesso |
| Relatório pós-aula enviado ao responsável e à administração | Falta de registro e de comunicação |
| Cancelamento com regra das 4h (fora do prazo, cobrança integral ao curso) | Perdas com faltas sem aviso |
| Suspensão de pacote do aluno (cancela as aulas futuras) | Aulas fantasmas na agenda |
| Apuração mensal do pagamento por professor (1h, 1h30, 2h) | Problemas de caixa |

## Tecnologias
- Next.js 15 (App Router) + React 19 + TypeScript
- CSS próprio, mobile-first (barra de abas no celular)
- Planejado: Supabase (Postgres, Auth, RLS), Brevo (e-mail), Vercel (hospedagem), domínio no registro.br

## Como rodar
```bash
npm install
npm run dev      # http://localhost:3000
# ou produção
npm run build && npm start
```
Requer Node.js 18.18 ou superior.

## Roteiro de demonstração
1. Entre como **Guilherme** (administrador) e veja o resumo da semana.
2. Em **Professores**, aprove o cadastro de Rafael Torres (gera e-mail de liberação).
3. Em **Agenda**, clique em **+ Nova aula**: escolha professor, aluno e horário. O sistema avisa conflitos e horários fora da disponibilidade.
4. Abra a aula de Química de hoje (começa em ~2h) e cancele: a regra das 4h marca como fora do prazo.
5. Saia e entre como **Beatriz Lima** (professora): veja aulas, valor do mês e envie o relatório de uma aula concluída.
6. Volte como administrador: confira o relatório, veja **Pagamentos** e a **Caixa de e-mails**.

Use **Restaurar demo** na tela de entrada para voltar aos dados iniciais.

## Estrutura
- `app/admin/*`: telas da administração
- `app/professor/*`: painel do professor
- `lib/store.tsx`: estado e regras de negócio (agendar, cancelar, relatório, aprovação)
- `lib/seed.ts`: dados de demonstração
- `lib/util.ts`: datas, conflitos e disponibilidade
