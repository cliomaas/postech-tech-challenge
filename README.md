# Tech Challenge - Fase 4 (Pós-Tech FIAP)

Aplicação de gerenciamento financeiro evoluída para a **Fase 4** do Tech Challenge da Pós-Tech FIAP. O projeto simula uma experiência bancária digital com autenticação, dashboard financeiro, extrato de transações, microfrontends e organização orientada a Clean Architecture.

Nesta fase, o foco foi evoluir a base das fases anteriores com:

- arquitetura front-end mais modular;
- separação entre domínio, aplicação, infraestrutura e apresentação;
- segurança no fluxo de autenticação;
- cache e otimizações de carregamento;
- documentação clara para execução e demonstração.

---

## Tecnologias utilizadas

- [Next.js 15](https://nextjs.org/) + React 19
- TypeScript
- Zustand
- NextAuth com Credentials Provider
- Single SPA + Vite para microfrontends
- Tailwind CSS
- Recharts
- JSON Server como API mockada
- Storybook para documentação do Design System
- ESLint

---

## Funcionalidades

- Login e cadastro de usuários.
- Rotas protegidas para dashboard e transações.
- Criação, edição, cancelamento e restauração de transações.
- Suporte a depósito, transferência, pagamento, saque e Pix.
- Agendamento e processamento de transações.
- Dashboard com saldo, receitas, despesas e gráficos.
- Filtros e busca no extrato.
- Comunicação entre shell e microfrontends via eventos.
- Design System próprio com componentes reutilizáveis.

---

## Arquitetura

A aplicação foi reorganizada seguindo princípios de **Clean Architecture**. A regra central é manter as decisões de negócio separadas de frameworks, HTTP, Zustand e componentes visuais.

```txt
lib/
  domain/
    transactions/      Regras e tipos do negócio financeiro
  application/
    transactions/      Casos de uso e contrato de repositório
  infra/
    transactions/      Implementação HTTP/json-server
    auth/              Hash e verificação de senha
  presentation/
    stores/            Store Zustand focada em estado da UI
```

### Domain

A camada de domínio concentra regras puras de transação:

- identificação de receitas e despesas;
- normalização de status e categoria;
- regras de edição, cancelamento e restauração;
- expiração de transações agendadas;
- montagem/finalização de payload de transação.

Essa camada não conhece React, Zustand, Next.js ou HTTP.

### Application

A camada de aplicação expõe os casos de uso:

- listar transações;
- criar transação;
- atualizar transação;
- cancelar/restaurar transação;
- remover transação;
- processar transações pendentes.

Ela depende de uma interface de repositório, não de uma implementação concreta.

### Infra

A camada de infraestrutura implementa detalhes externos:

- chamadas HTTP para o JSON Server;
- serialização de query params;
- cache em memória das transações;
- invalidação do cache após mutações;
- hash e verificação de senha.

### Presentation

O Zustand foi mantido como ferramenta de estado, mas agora atua como orquestrador:

- chama casos de uso da camada `application`;
- atualiza estado local da UI;
- controla loading, notificações e eventos;
- não concentra regra de negócio nem chamadas HTTP diretas.

---

## Segurança

O projeto usa **NextAuth** com Credentials Provider para proteger as rotas `/dashboard` e `/transactions`.

As senhas não são persistidas em texto puro. No cadastro, a senha é transformada em um hash `scrypt` antes de ser enviada ao backend mockado:

```json
{
  "email": "fulano@gmail.com",
  "passwordHash": "scrypt$16384$8$1$..."
}
```

No login, a senha digitada é verificada contra o hash salvo. A aplicação não precisa recuperar nem armazenar a senha original.

Variáveis principais:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=coloque-uma-string-segura
NEXT_PUBLIC_API_URL=http://localhost:4000
ADMIN_EMAIL=seu-email@exemplo.com
ADMIN_PASSWORD_HASH=scrypt$16384$8$1$...
```

### Limitação do JSON Server

O JSON Server é usado apenas como backend demonstrativo para a entrega acadêmica. Ele não substitui um backend real com banco de dados, autorização por usuário, rate limit, auditoria, rotação de segredos e políticas de segurança em produção.

---

## Performance e cache

As principais otimizações aplicadas foram:

- cache em memória para listagem e busca de transações;
- TTL curto para reduzir requisições repetidas sem deixar a UI obsoleta por muito tempo;
- invalidação do cache após criação, edição, cancelamento, restauração ou remoção;
- lazy loading de gráficos do dashboard;
- lazy loading do formulário de nova transação;
- preconnect/prefetch dos bundles dos microfrontends;
- configuração do ESLint 9 para validação do projeto.

O cache fica na camada de infraestrutura, perto do repositório HTTP, porque é um detalhe de acesso a dados e não uma regra de negócio.

---

## Microfrontends

O shell principal é Next.js. As áreas de Dashboard e Transações podem ser carregadas como microfrontends via Single SPA.

- `apps/mfe-dashboard`: microfrontend de dashboard.
- `apps/mfe-transactions`: microfrontend de transações.
- `src/mf/root-config.ts`: registro, carregamento e ativação dos MFEs.
- `src/mf/events.ts`: comunicação entre aplicações via `CustomEvent`.

URLs locais padrão:

```bash
http://localhost:9101/mfe-dashboard.umd.js
http://localhost:9102/mfe-transactions.umd.js
```

Variáveis opcionais:

```bash
NEXT_PUBLIC_MFE_DASHBOARD_URL=http://localhost:9101/mfe-dashboard.umd.js
NEXT_PUBLIC_MFE_TRANSACTIONS_URL=http://localhost:9102/mfe-transactions.umd.js
VITE_API_URL=http://localhost:4000
```

---

## Como rodar localmente

Instale as dependências:

```bash
npm install
npm --prefix apps/mfe-dashboard install
npm --prefix apps/mfe-transactions install
```

Rode API, shell e microfrontends:

```bash
npm run dev:all
```

Acesse:

```bash
http://localhost:3000
```

Serviços locais:

- `3000`: Next.js
- `4000`: JSON Server
- `9101`: MFE Dashboard
- `9102`: MFE Transações

---

## Docker

```bash
docker compose up --build
```

Portas expostas:

- `3000`: Next.js
- `4000`: JSON Server
- `9101`: MFE Dashboard
- `9102`: MFE Transações

---

## Scripts

```bash
npm run api              # JSON Server em http://localhost:4000
npm run dev              # Next.js
npm run dev:mfes         # Microfrontends
npm run dev:all          # API + Next.js + MFEs
npm run build            # Build de produção
npm run lint             # ESLint
npm run storybook        # Storybook
npm run build-storybook  # Build do Storybook
```

---

## Design System

O projeto possui Design System próprio documentado em Storybook:

```bash
npm run storybook
```

Acesse:

```bash
http://localhost:6006
```

Componentes principais:

- Button
- Input
- Select
- Modal
- Badge
- Snackbar
- Card

---

## Decisões técnicas

- Transações não são excluídas fisicamente; o fluxo usa cancelamento/restauração para preservar histórico.
- A regra de negócio fica em `domain`, isolada de React e HTTP.
- Casos de uso ficam em `application`, consumindo um contrato de repositório.
- HTTP, cache e JSON Server ficam em `infra`.
- Zustand fica em `presentation`, coordenando estado e ações da UI.
- O JSON Server foi mantido como backend mockado para simplificar a entrega e a demonstração.
- Senhas são persistidas apenas como hash `scrypt`.

---

## Roteiro do vídeo demonstrativo (até 5 minutos)

Sugestão de roteiro objetivo:

1. **Abertura (20s)**
   - Apresentar o Bytebank e explicar que a Fase 4 evolui a aplicação com arquitetura, segurança e performance.

2. **Arquitetura (50s)**
   - Mostrar rapidamente as pastas `domain`, `application`, `infra` e `presentation`.
   - Explicar que domínio guarda regras, aplicação guarda casos de uso, infra guarda HTTP/cache e presentation guarda Zustand/UI.

3. **Segurança (45s)**
   - Mostrar login/cadastro.
   - Explicar que a senha não é salva em texto puro e que o JSON Server armazena `passwordHash`.
   - Reforçar que JSON Server é demonstrativo.

4. **Fluxo funcional (1min30s)**
   - Entrar no dashboard.
   - Criar uma transação.
   - Ver atualização do saldo/extrato.
   - Editar, cancelar ou restaurar uma transação.

5. **Performance/cache (45s)**
   - Explicar cache de transações com invalidação em mutações.
   - Mostrar que gráficos e formulário são carregados sob demanda.
   - Citar prefetch/preconnect dos microfrontends.

6. **Fechamento (30s)**
   - Reforçar os ganhos: código mais modular, seguro, performático e preparado para evolução.

---

## Autora

**Clio Maas**

Desenvolvedora Front-End - Pós-Tech FIAP

[github.com/cliomaas](https://github.com/cliomaas)
