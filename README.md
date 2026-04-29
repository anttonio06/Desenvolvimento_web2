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
- Cadastro de usuários
- Perfis de usuário (admin, atendente)

### Clientes
- Cadastro, edição, listagem e exclusão
- Validação de e-mail e telefone únicos
- Visualização de pets vinculados

### Pets
- Cadastro vinculado ao cliente
- Informações detalhadas (espécie, raça, porte, observações)
- Exclusão em cascata dos agendamentos vinculados

### Serviços
- Cadastro com preço por porte (pequeno, médio, grande) e descrição
- Listagem e edição

### Agendamentos
- Criação com validação de conflito de horário
- Seleção de múltiplos serviços por agendamento
- Cálculo automático do valor total com base no porte do pet
- Cancelamento e reagendamento
- Filtro por status
- Controle de status:
  - Agendado
  - Concluído
  - Cancelado
  
### Dashboard
- Resumo do dia (agendamentos, clientes, pets e serviços)
- Lista de clientes cadastrados
- Lista de agendamentos recentes

---

## Regras de Negócio

- Não permitir mais de três agendamentos para mesma tarefa no mesmo horário
- Não permitir o mesmo pet com o(s) mesmo(s) serviço(s) no mesmo dia e horário
- Tosa e Hidratação só podem ser agendados junto com Banho
- Rotas protegidas por autenticação  
- Senhas armazenadas com hash
- Apenas o administrador pode visualizar senhas e excluir usuários

---

## Arquitetura

O sistema segue o padrão **MVC (Model-View-Controller)**:

- **Routes** → definição das rotas e controle das requisições
- **Views (EJS)** → renderização das páginas no servidor
- **Database** → acesso direto ao banco de dados SQLite

---

## Modelo de Dados

```txt
Usuario (id, nome, email, senha, permissoes)
Cliente (id, nome, telefone, email, criado_em)
Pet (id, cliente_id, nome, especie, raca, porte)
Servico(id, nome, duracao_min, preco_pequeno, preco_medio, preco_grande)
Agendamento(id, cliente_id, pet_id, data_hora, status, observacoes, valor)
Agend_Servicos(id, agendamento_id, servico_id, valor)
```
## Diagramas de Arquitetura em Modelo C4

<img width="474" height="640" alt="image" src="https://github.com/user-attachments/assets/f76152dc-1727-48e8-a95c-232bfc255bc9" />

<img width="478" height="904" alt="image" src="https://github.com/user-attachments/assets/b4149b8c-e0fa-4135-80cb-324f0d6933db" />

<img width="717" height="903" alt="image" src="https://github.com/user-attachments/assets/3b4faa05-ca1e-4737-bed2-026b1b6cfdf1" />

<img width="684" height="778" alt="image" src="https://github.com/user-attachments/assets/45983cde-d69a-4b25-9bed-561648b2d515" />


