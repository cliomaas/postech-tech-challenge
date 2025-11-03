
# POSTECH — Tech Challenge — Fase 1

Frontend de gerenciamento financeiro (Next.js + Tailwind + Design System + Storybook) com dados mockados no **localStorage**. Atende aos requisitos do PDF da fase 1.

## 🔧 Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS (tokens + DS simples)
- Zustand (store com persistência em localStorage)
- Storybook (documentação de componentes)

## ✨ Funcionalidades
- **Home**: saldo da conta, últimas transações e atalho para nova transação.
- **Transações**: listagem, busca, filtros simples, ações de **ver**, **editar** e **excluir**.
- **Nova/Editar**: modal com validação simples.
- **Mock de dados**: seed inicial via `data/transactions.json` carregada na primeira execução; depois persiste em `localStorage`.

## ▶️ Rodando
```bash
# 1) instalar
npm i

# 2) executar app
npm run dev

# 3) abrir o Storybook (opcional)
npm run storybook
```

> Requer Node 18+.

## 🧱 Estrutura
```
app/
  layout.tsx
  page.tsx                # Home
  transactions/
    page.tsx              # Listagem
  globals.css
components/
  ds/                     # Design System (botão, card, input etc.)
  charts/
  forms/
data/
  transactions.json       # Seed
lib/
  store.ts                # Zustand + persistência
  types.ts
  utils.ts
storybook/
  preview.ts
  main.ts
```

## 🧪 Vídeo
Grave um vídeo curto (≤ 5min) navegando: Home → Transações → Adicionar → Editar → Excluir. (TODO)

## 📝 Acessibilidade
- Foco visível, semântica em tabelas, rótulos conectados a inputs, nomes acessíveis em botões.

## 🧩 Observações
- O projeto Figma é referência. Mantive consistência visual usando tokens Tailwind e componentes reutilizáveis.
- Se quiser trocar Tailwind UI por outra lib, fique à vontade; o DS está desacoplado.
```
