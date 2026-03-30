# PetAgenda  
### Sistema Web de Agendamento para Pet Shop

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express.js-Backend-black)
![EJS](https://img.shields.io/badge/EJS-SSR-orange)
![SQLite](https://img.shields.io/badge/SQLite-Database-blue)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

---

## Integrantes

- **Anttonio Osório Molinaro Maccagnini**  
- **Gabriel Lengert Guedes**  
- **Turma:** T2ESOFT05NB

---

## Sobre o Projeto

O **PetAgenda** é uma aplicação web desenvolvida para gerenciar atendimentos em pet shops, permitindo o controle completo de:

- Clientes  
- Pets  
- Serviços  
- Agendamentos  

O sistema foi criado para **evitar conflitos de horários**, melhorar a organização e otimizar a rotina do estabelecimento.

---

## Objetivo

Desenvolver um sistema web com:

- Renderização no servidor (SSR)
- Banco de dados relacional
- Operações completas de CRUD
- Transação principal de agendamento

---

## Funcionalidades

### Autenticação
- Login e logout
- Perfis de usuário (admin, atendente, cliente)

### Clientes
- Cadastro, edição, listagem e exclusão

### Pets
- Cadastro vinculado ao cliente
- Informações detalhadas (espécie, raça, porte, observações)

### Serviços
- Cadastro com preço, duração e descrição

### Agenda
- Visualização por dia ou semana
- Filtros por serviço, pet ou atendente

### Agendamentos
- Criação com validação de conflito
- Cancelamento e reagendamento
- Controle de status:
  - Marcado
  - Em atendimento
  - Concluído
  - Cancelado

---

## Regras de Negócio

- Não permitir dois agendamentos no mesmo horário  
- Considerar duração do serviço para evitar conflitos  
- Rotas protegidas por autenticação  
- Senhas armazenadas com hash  

---

## Arquitetura

O sistema segue o padrão **MVC (Model-View-Controller)**:

- **Routes** → definição das rotas  
- **Controllers** → controle das requisições  
- **Services** → regras de negócio  
- **Repositories** → acesso ao banco de dados  

---

## Modelo de Dados

```txt
Usuario (id, nome, email, senha, permissoes)
Cliente (id, nome, telefone, email)
Pet (id, cliente_id, nome, especie, raca, porte, observacoes)
Servico (id, nome, duracao_min, preco, descricao)
Agendamento (id, cliente_id, pet_id, servico_id, data_hora, status, observacoes)
