# 💸 Tech Challenge – Fase 1 (Pós-Tech FIAP)

Gerenciador de transações financeiras desenvolvido como parte do **Tech Challenge – Fase 1** da pós-graduação em *Front-End Engineering* (FIAP).  
O projeto simula uma interface bancária moderna, permitindo **visualizar, criar, editar e cancelar transações**, além de acompanhar o **saldo** e o **extrato** em tempo real.

---

## 🚀 Tecnologias utilizadas
- [Next.js 14](https://nextjs.org/) + React 18  
- [TypeScript](https://www.typescriptlang.org/)  
- [Zustand](https://zustand-demo.pmnd.rs/) (persistência em estado local)  
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

# 2. Rodar em modo de desenvolvimento
npm run dev

# 3. Abrir no navegador
http://localhost:3000
```

---

## 🧪 Scripts disponíveis

```bash
npm run dev          # inicia o servidor local (Next.js)
npm run build        # cria a versão de produção
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

## 📽️ Entrega / Demonstração

O vídeo de entrega (até **5 minutos**) demonstra:

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
