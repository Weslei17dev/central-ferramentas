# Colocar no ar: Neon + Render + GitHub Pages — Runbook

> Arquitetura validada por você em outro projeto, aplicada aqui:
> **front-end estático (GitHub Pages) → API própria em Node/Express
> (Render) → Postgres (Neon)**. Sem Data API, sem provedor de auth externo
> — a autenticação (e-mail/senha, JWT) é código nosso, em `server/`.

```
GitHub Pages          Render                    Neon
(HTML/CSS/JS)   --->   API Express (server/)  --->  Postgres
  fetch() com                 |
  Authorization:               login/cadastro (bcrypt + JWT)
  Bearer <JWT>                 CRUD genérico (uma rota, todas as tabelas)
```

Esses passos são feitos por você — só você tem acesso à sua conta do Neon,
Render e GitHub.

---

## Passo 1 — Criar o banco no Neon

1. Crie uma conta em [neon.tech](https://neon.tech) (tem plano grátis) e um
   projeto novo.
2. No painel do projeto, copie a **Connection string** (aba "Connect") —
   é algo como:
   ```
   postgresql://usuario:senha@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Guarde essa string — vai ser o `DATABASE_URL` no passo 3.

Não precisa criar tabela nenhuma pelo painel — o script de migração (passo
3) faz isso rodando `server/db/schema.sql` por você.

## Passo 2 — Testar local antes de publicar (recomendado)

Isso evita descobrir um erro de configuração só depois de já ter subido pra
Render.

```bash
cd server
cp .env.example .env
# abra o .env e preencha DATABASE_URL (passo 1), JWT_SECRET (qualquer
# frase longa e aleatória) e ADMIN_NOME/ADMIN_EMAIL/ADMIN_SENHA
npm install
npm run setup    # roda o schema.sql + cria seu usuário admin
npm run dev      # sobe a API local em http://localhost:3000
```

Em outro terminal, confira:
```bash
curl http://localhost:3000/api/health
# deve responder: {"status":"ok"}

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"SEU_ADMIN_EMAIL","senha":"SUA_ADMIN_SENHA"}'
# deve responder um token
```

## Passo 3 — Publicar a API na Render

1. Suba a pasta `server/` para um repositório no GitHub (pode ser o mesmo
   repositório do front-end, ou um separado — tanto faz).
2. Em [render.com](https://render.com), crie um **Web Service** novo,
   apontando pro repositório.
   - **Root Directory**: `server` (se front-end e API estiverem no mesmo
     repositório)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Em **Environment**, adicione as variáveis (mesmos valores do seu `.env`
   local):
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS` → a URL do seu GitHub Pages (passo 5), ex:
     `https://seu-usuario.github.io`
4. Depois do primeiro deploy, rode a migração e o seed **uma vez**, contra o
   banco de produção — a forma mais simples é rodar local, mudando o
   `DATABASE_URL` do seu `.env` local pro do Neon de produção (o mesmo do
   passo 1) e rodando `npm run setup` de novo a partir da sua máquina — o
   schema/seed não têm nada específico da Render, só do banco.
5. Copie a URL pública que a Render deu pra sua API (algo como
   `https://central-de-ferramentas-api.onrender.com`).

> **Plano grátis da Render "dorme"**: se ninguém usar por um tempo, o
> primeiro acesso depois disso demora uns 30-60s pra "acordar" o serviço.
> Isso é normal do plano grátis, não é bug.

## Passo 4 — Preencher `assets/js/config.js`

Abra `assets/js/config.js` (no projeto do front-end) e cole a URL da Render
do passo anterior:

```js
const API_BASE_URL = "https://central-de-ferramentas-api.onrender.com";
```

## Passo 5 — Publicar o front-end no GitHub Pages

1. Crie um repositório no GitHub (pode ser privado) e suba todos os
   arquivos da pasta `central-de-ferramentas/` (a raiz do front-end — NÃO
   inclua a pasta `server/` aqui se for um repositório separado) para a
   raiz do repositório.
2. Configurações do repositório → **Pages** → branch `main`, pasta
   `/ (root)` → Salvar.
3. Anote a URL que o GitHub te dá (`https://seu-usuario.github.io/repo/`).
4. **Volte no passo 3** e confirme que `ALLOWED_ORIGINS` na Render tem essa
   URL exata (sem barra no final) — sem isso, o navegador bloqueia as
   chamadas por causa do CORS.

## Passo 6 — Testar de ponta a ponta

1. Abra a URL do GitHub Pages.
2. Deve cair em `login.html`. Entre com o e-mail/senha do `ADMIN_EMAIL`/
   `ADMIN_SENHA` que você definiu no seed.
3. Teste o módulo **Clientes** — é o único 100% convertido até agora:
   cadastrar, editar, favoritar, excluir um cliente.
4. Outras pessoas da equipe criam a própria conta pela aba "Criar conta" —
   todo mundo cai no mesmo workspace (dados compartilhados).

---

## O que já foi migrado (funciona 100% em rede)

- **API completa** (`server/`) — testada de ponta a ponta neste ambiente
  (login, CRUD genérico, proteção por token, bloqueio de tabela não
  permitida, rota pública do portfólio, rota de perfil). Ver "Como foi
  testado" abaixo.
- **Login/cadastro/logout** (`login.html`, `assets/js/auth.js`).
- **Sidebar/header, tema, favoritos, avatar** (`app-shell.js`,
  `partials.js`) — já assíncrono.
- **Clientes** (`crm/index.html`) — módulo piloto, 100% convertido. Use
  como modelo para os próximos.

### Como a API foi testada (antes de chegar até você)

Rodei um Postgres local, apliquei `server/db/schema.sql` de verdade (as 29
tabelas foram criadas certinho), criei um usuário via seed, e testei pela
API real: login, criar/listar/editar/excluir um cliente, acesso sem token
(bloqueado, 401), acesso a uma tabela não permitida como `usuarios`
(bloqueado, 404), leitura pública do portfólio sem token (200), e leitura
do perfil. Todos passaram. Também encontrei e corrigi um bug real nesse
processo: erro de conexão com o banco durante login derrubava o processo
inteiro do servidor (faltava `try/catch`) — corrigido, e agora há uma rede
de segurança extra em `server/src/index.js` para qualquer erro parecido no
futuro.

## O que AINDA precisa ser convertido

Todo o resto do sistema ainda chama `getAll`/`inserir`/`atualizar`/`remover`
como se fossem síncronos (jeito antigo, do `localStorage`). A conversão
segue sempre o mesmo padrão usado em `crm/index.html`:

1. Toda função que chama essas operações precisa virar `async function`.
2. Toda chamada a elas precisa ganhar `await` na frente.
3. Se algo tipo `ehFavorito()` era chamado várias vezes dentro de um
   `.map()` — busque o dado **uma vez**, antes do `.map()` (como
   `favoritosClientes` em `crm/index.html`).
4. Chamadas a **`saveAll(...)`** precisam virar uma sequência de
   `inserir`/`atualizar`/`remover` — afeta principalmente
   `projetos/kanban.html` (reordenar/remover colunas do Kanban).
5. As funções auxiliares listadas no fim de `assets/js/db.js` (seção "AINDA
   NÃO CONVERTIDAS") seguem o mesmo padrão de `alternarFavorito` (já
   convertida, como referência).

**Páginas que ainda usam o padrão antigo** (todas, exceto
`crm/index.html`): `crm/funil.html`, `crm/produtos.html`, `crm/tarefas.html`,
`projetos/*.html`, `equipe/index.html`, `agenda/index.html`,
`financeiro/index.html`, `estoque/index.html`, `tickets/index.html`,
`drive/index.html`, `snippets/index.html`, `conhecimento/index.html`,
`prompts/index.html`, `categorias/index.html`, `portfolio/editar.html`,
`perfil/index.html`, `relatorios/*.html`, `menu/index.html`.

Peça para eu continuar a conversão módulo por módulo.

---

## Pendências conhecidas (fora do escopo desta primeira fase)

- **Drive de Arquivos** — os arquivos binários hoje ficam no IndexedDB do
  navegador (`idb-arquivos.js`), local por natureza — não funciona entre
  pessoas diferentes numa aplicação em rede. Antes de migrar o Drive,
  escolher onde guardar os arquivos de verdade (Cloudflare R2, S3, etc.) —
  o Postgres não é o lugar certo pra isso.
- **Sincronização em tempo real entre pessoas** — hoje, se a Ana move um
  card no Kanban, o Pedro só vê ao recarregar a página. Multiplayer de
  verdade exigiria polling periódico ou um canal de tempo real (ex:
  WebSocket) — não crítico pra começar a usar.
- **Gerenciar usuários** — hoje qualquer pessoa com o link do GitHub Pages
  pode se cadastrar sozinha pela tela de login. Se quiser controlar quem
  entra, ainda não tem tela pra isso — dá pra desativar um usuário rodando
  SQL direto no Neon por enquanto (`DELETE FROM usuarios WHERE email = ...`).
- **Renovação de sessão** — o JWT dura 30 dias; depois disso, a pessoa
  precisa logar de novo. Não tem "lembrar de mim" nem renovação automática
  ainda.
