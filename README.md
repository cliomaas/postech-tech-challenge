# 💸 Tech Challenge – Fase 1 (Pós-Tech FIAP)

Gerenciador de transações financeiras desenvolvido como parte do **Tech Challenge – Fase 1** da pós-graduação em *Front-End Engineering* (FIAP).  
O projeto simula uma interface bancária moderna, permitindo **visualizar, criar, editar e cancelar transações**, além de acompanhar o **saldo** e o **extrato** em tempo real.

---

## 🚀 Tecnologias utilizadas
- [Next.js 15](https://nextjs.org/) + React 19  
- [TypeScript](https://www.typescriptlang.org/)  
- [Zustand](https://zustand-demo.pmnd.rs/) (persistência em estado local)  
- [Single SPA](https://single-spa.js.org/) + Vite (microfrontends independentes)  
- [Tailwind CSS](https://tailwindcss.com/)  
- **Design System** próprio documentado em [Storybook](https://storybook.js.org/) (`npm run storybook`)  
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)  

---

## 🧭 Estrutura principal

| Área                                 | Descrição                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Home**                             | Exibe o **saldo atual**, **últimas transações** e botão “Nova transação”.                        |
| **Transações**                       | Lista todas as transações com **edição**, **cancelamento** e **restauração**.                    |
| **Formulário (`TxForm`)**            | Modal de criação/edição. Bloqueia **datas anteriores a hoje**, valida **valor** e **descrição**. |
| **Store (`useTxStore`)**             | Gerencia as ações `add`, `patch`, `cancel`, `restore`.                                           |
| **Design System (`/components/ds`)** | Conjunto reutilizável de componentes (`Button`, `Input`, `Select`, `Modal`, `Badge`).            |

---

## 🧩 Microfrontends (Single SPA)

- **Shell SSR/SSG:** Next.js mantém o SSR/SSG e entrega o layout base.
- **MFEs independentes:** `Dashboard` e `Transações` vivem em `apps/mfe-dashboard` e `apps/mfe-transactions`.
- **Build isolado:** cada MFE gera bundle UMD via Vite e é servido localmente (ports 9101/9102).
- **Roteamento:** `activeWhen` em `src/mf/root-config.ts` ativa cada MFE conforme a rota.
- **Comunicação:** eventos `CustomEvent` (`mfe:tx`) em `src/mf/events.ts` notificam mudanças de transações.

URLs locais padrão dos MFEs:
- `http://localhost:9101/mfe-dashboard.umd.js`
- `http://localhost:9102/mfe-transactions.umd.js`

Variáveis opcionais (shell):
```
NEXT_PUBLIC_MFE_DASHBOARD_URL=http://localhost:9101/mfe-dashboard.umd.js
NEXT_PUBLIC_MFE_TRANSACTIONS_URL=http://localhost:9102/mfe-transactions.umd.js
```

Variáveis opcionais (MFEs):
```
VITE_API_URL=http://localhost:4000
```

---

## 🧩 Funcionalidades

✅ Criar nova transação (depósito, transferência, pagamento, saque ou PIX)  
✅ Editar transação existente  
✅ Cancelar / Restaurar transação  
✅ Bloquear datas anteriores a hoje  
✅ Atualizar saldo automaticamente  
✅ Filtrar/buscar transações  
✅ Interface responsiva e consistente via Design System  

---

## 🧠 Sobre o *Cancelar × Excluir*

Em um sistema financeiro real, **transações não são excluídas fisicamente** — são **canceladas** ou **estornadas**, preservando o histórico para auditoria.  
Por isso, neste projeto o botão **Cancelar** representa o “Delete” lógico do CRUD:

- `PATCH` → muda o `status` para `"cancelled"`  
- a transação permanece listada (com *badge* “Cancelada”)  
- o saldo é ajustado para refletir o cancelamento  

> 💡 Essa decisão foi proposital para refletir a prática bancária e garantir integridade histórica.

---

## 🧱 Design System & Storybook

O Design System do projeto inclui componentes reutilizáveis com documentação em **Storybook**.

```bash
npm run storybook
```

Abra [http://localhost:6006](http://localhost:6006) para visualizar.

Componentes principais:
- `Button` (variações: primary / ghost / danger)  
- `Input` (text | number | date)  
- `Select`  
- `Modal`  
- `Badge`

---

## 🧰 Como rodar o projeto

```bash
# 1. Instalar dependências
npm install

# 1.1. Instalar dependências dos MFEs (uma vez)
npm --prefix apps/mfe-dashboard install
npm --prefix apps/mfe-transactions install

# 2. Rodar em modo de desenvolvimento
npm run dev:all

# 3. Abrir no navegador
http://localhost:3000
```

---

## 🐳 Docker

```bash
docker compose up --build
```

Portas expostas:
- `3000` (Next.js)
- `4000` (JSON Server)
- `9101` (mfe-dashboard)
- `9102` (mfe-transactions)

As variáveis de ambiente já estão no `docker-compose.yml` para rodar tudo localmente.

---

## 🩹 Troubleshooting

Problemas comuns e soluções rápidas:
- **MFE não carrega**: confirme se `http://localhost:9101/mfe-dashboard.umd.js` e `http://localhost:9102/mfe-transactions.umd.js` respondem.
- **Erro `process is not defined`**: reinicie os MFEs (Vite). O build precisa do `define` no Vite config.
- **Erro `missing lifecycle exports`**: o bundle UMD precisa expor `bootstrap/mount/unmount` no `window` (já configurado).
- **NextAuth error `NO_SECRET`**: verifique `NEXTAUTH_SECRET` no `.env.local` ou no `docker-compose.yml`.

---

## 🧪 Scripts disponíveis

```bash
npm run dev          # inicia o servidor local (Next.js)
npm run dev:mfes     # inicia os MFEs (Vite build+preview)
npm run dev:all      # API + Next + MFEs
npm run api          # JSON Server em http://localhost:4000
npm run build        # cria a versão de produção (shell)
npm run lint         # verifica erros de lint
npm run storybook    # inicia o Storybook
npm run test         # executa testes (caso configurados)
```

---

## 🧠 Decisões técnicas

- O **cancelamento** é tratado como *update lógico*, e não exclusão real.
- O estado global usa **Zustand**, permitindo atualizações reativas e desacopladas.
- Datas são normalizadas em formato `YYYY-MM-DD` e bloqueadas para o passado.
- O layout segue uma hierarquia simples e responsiva com **Tailwind**.
- O **Design System** garante consistência visual e facilita manutenção.

---

## 🔐 Autenticacao (ambiente cloud)

Para proteger o acesso ao app em producao, foi adicionado **NextAuth (Credentials)**.
Rotas protegidas: `/dashboard` e `/transactions` (via `middleware.ts`).

Variaveis de ambiente necessarias:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=coloque-uma-string-segura
ADMIN_EMAIL=seu-email@exemplo.com
ADMIN_PASSWORD_HASH=scrypt$16384$8$1$...
```

> Em deploy (Vercel), configure essas variaveis no painel do projeto.

Cadastro (mock via API):
- A rota `POST /api/auth/register` envia usuarios para `NEXT_PUBLIC_API_URL` (ex: json-server no Render).
- O login consulta `GET /users?email=...` nessa mesma API.
- As senhas sao persistidas como hash `scrypt` no campo `passwordHash`; o app nao grava senha em texto puro.
- Para usuarios administrativos via variavel de ambiente, configure `ADMIN_PASSWORD_HASH` com um hash `scrypt` gerado pela aplicacao.
- O `json-server` e usado apenas como backend demonstrativo da entrega. Ele nao substitui um backend real com banco, controle de acesso por usuario, rate limit, auditoria e politicas de segredo.

---

## 📽️ Entrega / Demonstração

O vídeo de entrega demonstra:

1. Acesso à home e visualização do saldo.  
2. Criação de novas transações.  
3. Edição de uma transação existente.  
4. Cancelamento de uma transação (com atualização do saldo).  
5. Restauração de uma transação cancelada.  
6. Acesso ao Storybook e visualização dos componentes do Design System.

---

## 👩‍💻 Autora

**Clio Maas**  
Desenvolvedora Front-End • Pós-Tech FIAP  
[github.com/cliomaas](https://github.com/cliomaas)

---
