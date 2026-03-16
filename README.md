PetAgenda — Sistema Web de Agendamento para Pet Shop

Alunos: Anttonio Osório Molinaro Maccagnini e Gabriel Lengert Guedes. Turma: T2ESOFT05NB

Domínio do Problema Este projeto implementa uma aplicação web para agendamento de serviços de pet shop, permitindo organizar atendimentos de banho, tosa, hidratação, consulta básica e corte de unhas. O sistema centraliza o cadastro de clientes, pets, serviços e agendamentos, evitando conflitos de horário e facilitando a rotina do pet shop. A aplicação será construída como um sistema web com páginas renderizadas no servidor (SSR) e persistência em banco de dados relacional (1 CRUD e 1 transação).

Requisitos Funcionais (RF)

RF01 — Autenticação: permitir login/logout de usuários (ex.: atendente, administrador e cliente).

RF02 — CRUD de Clientes: cadastrar, listar, editar e excluir clientes (nome, telefone, email).

RF03 — CRUD de Pets: cadastrar, listar, editar e excluir pets vinculados a um cliente (nome, espécie, raça, porte, observações).

RF04 — CRUD de Serviços: cadastrar, listar, editar, e excluir serviços (nome, preço, duracao_min, descrição).

RF05 — Visualizar Agenda: exibir agendamentos por dia/semana com filtros (por serviço, por atendente, por pet).

RF06 — Transação: Criar Agendamento de Serviço

selecionar cliente + pet + serviço + data/hora;
validar se já existe agendamento no mesmo horário (conflito);
registrar o agendamento e seu status (ex.: “Marcado”).
RF07 — Cancelar/Reagendar: permitir cancelar ou reagendar (mantendo histórico básico).

RF08 — Status do Atendimento: atualizar status (Marcado, Em atendimento, Concluído, Cancelado).

Requisitos Não Funcionais (RNF)
RNF01 — Segurança: armazenar senha com hash e exigir autenticação para rotas privadas.
RNF02 — Usabilidade: interface simples, responsiva e com feedback (mensagens de sucesso/erro).
RNF03 — Organização em camadas: o sistema será estruturado por rotas, controllers, serviços e repositórios, seguindo o padrão MVC para facilitar manutenção e evolução do código.
RNF04 — Persistência: dados em banco relacional (SQLite no dev; MySQL opcional em produção).
RNF05 — Confiabilidade: impedir conflitos de agenda por validação no back-end.
Tecnologias e Justificativas
Node.js + Express

Permite criar rotas e regras de negócio de forma rápida, sendo adequado para desenvolvimento web.
EJS (Server-Side Rendering)

Possibilita renderização no servidor, simplificando a construção das telas.
SQLite (Banco principal)

Banco leve e fácil de configurar localmente, ideal para desenvolvimento em dupla sem dependência de servidor externo.
MySQL (Opcional / Produção)

Alternativa de banco de dados bastante utilizada no mercado, pensada como uma possível evolução futura do projeto.
Bootstrap/CSS (Interface)

Auxilia na criação de uma interface responsiva e visualmente consistente.
Modelo de Dados (Resumo) Entidades previstas (pode haver alterações):
Usuario (id, nome, email, senha, permissoes)
Cliente (id, nome, telefone, email)
Pet (id, cliente_id, nome, especie, raca, porte, observacoes)
Servico (id, nome, duracao_min, preco, descricao)
Agendamento (id, cliente_id, pet_id, servico_id, data_hora, status, observacoes)
Regra de conflito (exemplo):

não permitir dois agendamentos com o mesmo data_hora (ou no mesmo intervalo de duração do serviço).
Organização de Tarefas (Dupla):
Nós iremos desenvolver o projeto em conjunto, realizando alinhamentos por ligações para implementar e revisar cada parte em tempo real. Para manter tudo organizado, vamos registrar as tarefas em um checklist simples (Issues do GitHub ou um Trello básico), marcando o que foi concluído e o que ficou pendente.

Divisão sugerida

Pessoa A (Anttonio Maccagnini) (Back-end/Banco)

modelagem do banco (SQLite) e tabelas
rotas do CRUD (clientes, pets, serviços)
regra de transação (criar agendamento sem conflito)
autenticação (sessão)
Pessoa B (Gabriel Lengert Guedes) (Front-end/EJS/UI)

telas EJS (login, listagens, formulários)
página da agenda (lista por dia/semana)
layout responsivo e mensagens de validação
integração das telas com as rotas
Checklist do MVP

 Setup do projeto Express + EJS
 Banco SQLite + tabelas
 Login + sessão
 CRUD Cliente
 CRUD Pet (vinculado ao cliente)
 CRUD Serviço
 Transação: Criar Agendamento (validar conflito)
 Página “Agenda do Dia”
 Cancelar/Reagendar + status
 Ajustes finais.
