# PetAgenda  
### Sistema Web de Agendamento para Pet Shop

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

## Link Para o Figma
https://www.figma.com/design/4812XawUkC89akWzElnj8Q/Projeto-Pet-Shop?t=X7kzn7t32UpVbS76-1

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
```
## Diagramas de Arquitetura em Modelo C4

<img width="474" height="640" alt="image" src="https://github.com/user-attachments/assets/f76152dc-1727-48e8-a95c-232bfc255bc9" />

<img width="478" height="904" alt="image" src="https://github.com/user-attachments/assets/b4149b8c-e0fa-4135-80cb-324f0d6933db" />

<img width="717" height="903" alt="image" src="https://github.com/user-attachments/assets/3b4faa05-ca1e-4737-bed2-026b1b6cfdf1" />

<img width="684" height="778" alt="image" src="https://github.com/user-attachments/assets/45983cde-d69a-4b25-9bed-561648b2d515" />


