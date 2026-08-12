-- ==========================================================================
-- SCHEMA.SQL — Central de Ferramentas, banco Postgres (Neon)
--
-- Arquitetura: front-end estático (GitHub Pages) -> API própria em
-- Node.js/Express (Render) -> este banco Postgres (Neon). O front-end
-- NUNCA fala direto com o Postgres — só a API. Por isso a segurança de
-- quem pode ler/escrever fica na API (middleware de login, JWT), não em
-- Row Level Security aqui no banco. Workspace único e compartilhado:
-- qualquer pessoa logada (tabela `usuarios`) vê e edita os mesmos dados.
--
-- Como rodar: `npm run migrate` dentro de server/ (usa este arquivo), ou
-- cole direto no SQL Editor do console do Neon. Rode uma vez só.
-- ==========================================================================

-- Extensão para gerar UUID (gen_random_uuid) — já vem habilitada no Neon,
-- mas garantindo:
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================================================
-- USUÁRIOS (login da própria API — e-mail/senha com hash, JWT emitido por
-- server/src/routes/auth.js)
-- ==========================================================================

CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  senha_hash text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- ==========================================================================
-- CRM
-- ==========================================================================

CREATE TABLE clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cor text,
  contato text,
  tags text[] DEFAULT '{}',
  observacoes text,
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  preco numeric(12,2) DEFAULT 0,
  tipo text, -- 'unico' | 'recorrente'
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE oportunidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  produto_id uuid REFERENCES produtos(id) ON DELETE SET NULL,
  valor numeric(12,2) DEFAULT 0,
  etapa text NOT NULL DEFAULT 'lead', -- lead|contato|proposta|negociacao|ganho|perdido
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tarefas_crm (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  responsavel_id uuid, -- referencia equipe(id), ver abaixo
  prioridade text DEFAULT 'media',
  prazo date,
  coluna text NOT NULL DEFAULT 'fazer', -- fazer|andamento|concluido
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- ==========================================================================
-- EQUIPE (precisa existir antes das tabelas que referenciam responsavel_id)
-- ==========================================================================

CREATE TABLE equipe (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cargo text,
  contato text,
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tarefas_crm ADD CONSTRAINT fk_tarefas_crm_responsavel
  FOREIGN KEY (responsavel_id) REFERENCES equipe(id) ON DELETE SET NULL;

-- ==========================================================================
-- PROJETOS
-- ==========================================================================

CREATE TABLE projetos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE kanban_colunas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  ordem integer NOT NULL DEFAULT 0
);

CREATE TABLE tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text,
  titulo text NOT NULL,
  descricao text,
  projeto_id uuid REFERENCES projetos(id) ON DELETE CASCADE,
  coluna_id uuid REFERENCES kanban_colunas(id) ON DELETE SET NULL,
  responsavel_id uuid REFERENCES equipe(id) ON DELETE SET NULL,
  prioridade text DEFAULT 'media',
  prazo date,
  tags text[] DEFAULT '{}',
  bloqueada_por uuid REFERENCES tarefas(id) ON DELETE SET NULL,
  subtarefas jsonb DEFAULT '[]',   -- [{titulo, concluida}]
  comentarios jsonb DEFAULT '[]',  -- [{autor, texto, data}]
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- ==========================================================================
-- AGENDA / FINANCEIRO / ESTOQUE
-- ==========================================================================

CREATE TABLE eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  data date NOT NULL,
  hora time,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  projeto_id uuid REFERENCES projetos(id) ON DELETE SET NULL,
  descricao text,
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL, -- entrada|saida
  descricao text,
  valor numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pago', -- pago|pendente
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  projeto_id uuid REFERENCES projetos(id) ON DELETE SET NULL,
  data date NOT NULL DEFAULT current_date,
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE itens_estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo text,
  categoria text,
  quantidade integer NOT NULL DEFAULT 0,
  estoque_minimo integer NOT NULL DEFAULT 0,
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE movimentos_estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES itens_estoque(id) ON DELETE CASCADE,
  tipo text NOT NULL, -- entrada|saida
  quantidade integer NOT NULL,
  motivo text,
  data timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ==========================================================================
-- DRIVE / TICKETS
-- ==========================================================================

CREATE TABLE arquivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text,
  tamanho bigint,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  projeto_id uuid REFERENCES projetos(id) ON DELETE SET NULL,
  ticket_id uuid, -- FK adicionada depois que "tickets" existir
  categoria text,
  tags text[] DEFAULT '{}',
  -- ATENÇÃO: o conteúdo binário do arquivo NÃO fica aqui (Postgres não é
  -- o lugar certo para blobs grandes). Guarde o arquivo em algo como
  -- Neon's object storage integration, S3, ou Cloudflare R2, e ponha só a
  -- URL/chave dele numa coluna nova (ex: `storage_key text`) quando for
  -- migrar o Drive de verdade — ver docs/MIGRACAO-NEON.md.
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero integer NOT NULL,
  titulo text NOT NULL,
  descricao text,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  responsavel_id uuid REFERENCES equipe(id) ON DELETE SET NULL,
  prioridade text DEFAULT 'media',
  status text NOT NULL DEFAULT 'aberto',
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE arquivos ADD CONSTRAINT fk_arquivos_ticket
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL;

CREATE TABLE ticket_comentarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  autor text,
  texto text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ticket_tempos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  minutos integer NOT NULL,
  descricao text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- ==========================================================================
-- PRODUTIVIDADE: Snippets, Base de Conhecimento, Prompts, Categorias
-- ==========================================================================

CREATE TABLE categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo text NOT NULL, -- artigo|snippet|prompt
  nome text NOT NULL
);

CREATE TABLE snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  linguagem text,
  tags text[] DEFAULT '{}',
  codigo text NOT NULL,
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE artigos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  categoria text,
  tags text[] DEFAULT '{}',
  link text,
  conteudo text,
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  categoria text,
  tags text[] DEFAULT '{}',
  conteudo text NOT NULL,
  ultimo_uso timestamptz,
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- ==========================================================================
-- RELATÓRIOS
-- ==========================================================================

CREATE TABLE metricas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tabela text NOT NULL,
  campo text,
  agregacao text NOT NULL, -- contagem|soma|media|minimo|maximo
  filtro_campo text,
  filtro_operador text,
  filtro_valor text,
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE relatorios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  publicado boolean NOT NULL DEFAULT false,
  blocos jsonb NOT NULL DEFAULT '[]',
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  padrao boolean NOT NULL DEFAULT false,
  slots jsonb NOT NULL DEFAULT '[]',
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- ==========================================================================
-- SISTEMA: log de atividades, portfólio, perfil, menu configurável
-- ==========================================================================

CREATE TABLE logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo text NOT NULL,
  acao text NOT NULL,
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  data timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE portfolio (
  id boolean PRIMARY KEY DEFAULT true CHECK (id), -- garante 1 linha só
  nome text,
  cargo text,
  bio text,
  tecnologias text[] DEFAULT '{}',
  links jsonb DEFAULT '{}',
  experiencias jsonb DEFAULT '[]',
  certificados jsonb DEFAULT '[]',
  projetos_destaque jsonb DEFAULT '[]'
);

-- Perfil agora é POR USUÁRIO (antes era um registro único local a cada
-- navegador; em rede, cada pessoa logada tem o seu).
CREATE TABLE perfis (
  usuario_id uuid PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  nome text NOT NULL,
  cargo text
);

CREATE TABLE menu_grupos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ordem integer NOT NULL DEFAULT 0
);

CREATE TABLE menu_atribuicoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ferramenta_chave text NOT NULL,
  grupo_id uuid REFERENCES menu_grupos(id) ON DELETE CASCADE
);

-- ==========================================================================
-- FAVORITOS (usado por Clientes, Projetos, Snippets, Artigos, Prompts —
-- o coraçãozinho de favoritar na sidebar)
-- ==========================================================================

CREATE TABLE favoritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,   -- cliente|projeto|snippet|artigo|prompt
  ref_id uuid NOT NULL,
  criado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- ==========================================================================
-- Dados iniciais (equivalentes ao que semearDadosIniciais() criava local)
-- ==========================================================================

INSERT INTO kanban_colunas (label, ordem) VALUES
  ('A Fazer', 1), ('Em Andamento', 2), ('Revisão', 3), ('Concluído', 4);

INSERT INTO layouts (nome, padrao, slots) VALUES
  ('Painel financeiro', true, '[
    {"tipo":"kpi","largura":"terco"},{"tipo":"kpi","largura":"terco"},{"tipo":"kpi","largura":"terco"},
    {"tipo":"colunas","largura":"completa"},{"tipo":"tabela","largura":"completa"}
  ]'),
  ('Visão geral', true, '[
    {"tipo":"kpi","largura":"metade"},{"tipo":"kpi","largura":"metade"},
    {"tipo":"rosca","largura":"metade"},{"tipo":"barras","largura":"metade"},
    {"tipo":"tabela","largura":"completa"}
  ]'),
  ('Só uma tabela', true, '[{"tipo":"tabela","largura":"completa"}]');

INSERT INTO menu_grupos (nome, ordem) VALUES
  ('CRM', 1), ('Área de Trabalho', 2), ('Relatórios', 3), ('Ferramentas', 4);

-- (as atribuições ferramenta→grupo ficam por conta da tela "Configurar
-- menu" depois do primeiro login — ela já funciona igual funcionava local)
