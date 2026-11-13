DROP TABLE IF EXISTS "Historico";
DROP TABLE IF EXISTS "Tarefa";
DROP TABLE IF EXISTS "Projeto";
DROP TABLE IF EXISTS "Usuario";

CREATE TABLE "Usuario" (
    "id"           SERIAL PRIMARY KEY,
    "nome"         TEXT NOT NULL,
    "cpf_hash"     TEXT NOT NULL UNIQUE,
    "email_cripto" TEXT NOT NULL UNIQUE,
    "senha_hash"   TEXT NOT NULL,
    "perfil"       TEXT NOT NULL
);

CREATE TABLE "Projeto" (
    "id"         SERIAL PRIMARY KEY,
    "id_usuario" INTEGER NOT NULL,
    "nome"       TEXT NOT NULL,
    "status"     TEXT NOT NULL,
    FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id")
);

CREATE TABLE "Tarefa" (
    "id"             SERIAL PRIMARY KEY,
    "id_projeto"     INTEGER NOT NULL,
    "id_responsavel" INTEGER NOT NULL,
    "titulo"         TEXT NOT NULL,
    "status"         TEXT NOT NULL,
    "data_hora"      TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("id_projeto")     REFERENCES "Projeto"("id"),
    FOREIGN KEY ("id_responsavel") REFERENCES "Usuario"("id")
);

CREATE TABLE "Historico" (
    "id"         SERIAL PRIMARY KEY,
    "id_tarefa"  INTEGER,
    "id_usuario" INTEGER NOT NULL,
    "acao"       TEXT NOT NULL,
    "data_hora"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("id_tarefa")  REFERENCES "Tarefa"("id") ON DELETE SET NULL,
    FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id")
);

INSERT INTO "Usuario" ("nome", "cpf_hash", "email_cripto", "senha_hash", "perfil") VALUES
  ('Administrador do Sistema', '909346a86da9a692c236d6ce50af1041d06e3072e32e8f4e7be1b74dc943a9cb', '0ac09a97bb8fe878970fb582884104c023101ce8b847d594e94f01926500d09b', '$2b$10$3jE8FN2YXrYka1qDO8iRiO38f/2g9qH7S6DEEKTlaGo.7.iKo74/W', 'admin'),
  ('Fernanda Lima',            'f4ee2b83a67d4f6197f776789e53afa9bd6ef538353d87b79e98d4e035f6a256', '3e145c137e3267da332fc634130a57b40cb3a24cf8fbd0ead5368579929a4f57', '$2b$10$Pf2wH/ghSiFDNiWunbvMwecWjMJLA3YIdiq8TRgUWsoXFxAO3zXga', 'gestor'),
  ('Rafael Souza',             'a0c2692710cdfe7e8246a598c5c943a977766f55b1d25e5cbb5b6c24d29cce3e', 'ea1ea6c625e69cd89e1fdfda0ecdc25158522f66e16bcf42fe6176dc695fcf35', '$2b$10$SASGAtE91Vy80MmKcX6qO.smL7mUrvmzO9xcFUQcRjGLS6QOg4Iai', 'colaborador'),
  ('Juliana Rocha',            '1f68d6fc857b5206376f85d8fdf0762e77c17de7b65819adc108ba3e89695a60', '37150817d4031408f780b1621080bc3077052e1de215653c382637c328191067', '$2b$10$hx.XMZmcGUi5cChnurs60uXt/z0Tp9n0uV90aAT7dGlkVe3ftbcN2', 'colaborador');

INSERT INTO "Projeto" ("id_usuario", "nome", "status") VALUES
  (1, 'Portal do Cliente',       'Em andamento'),
  (2, 'Migração do ERP',         'Planejado'),
  (2, 'Treinamento sobre LGPD',  'Concluído');

INSERT INTO "Tarefa" ("id_projeto", "id_responsavel", "titulo", "status", "data_hora") VALUES
  (1, 3, 'Levantar requisitos com o cliente',   'Concluída',    '2026-11-10 09:00:00'),
  (1, 4, 'Criar o protótipo das telas',         'Em andamento', '2026-11-18 14:00:00'),
  (2, 2, 'Mapear os dados do sistema antigo',   'Pendente',     '2026-11-24 10:30:00'),
  (2, 3, 'Planejar a migração dos cadastros',   'Pendente',     '2026-12-02 08:00:00'),
  (3, 4, 'Aplicar o treinamento para a equipe', 'Concluída',    '2026-11-05 15:00:00');

INSERT INTO "Historico" ("id_tarefa", "id_usuario", "acao", "data_hora") VALUES
  (1, 1, 'Criou a tarefa',              '2026-11-03 08:15:00'),
  (5, 2, 'Criou a tarefa',              '2026-11-03 09:40:00'),
  (5, 4, 'Alterou o status: Concluída', '2026-11-05 17:20:00'),
  (1, 3, 'Alterou o status: Concluída', '2026-11-10 11:05:00');
