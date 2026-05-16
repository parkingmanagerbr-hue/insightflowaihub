# InsightFlow — Documentação Completa de Funcionalidades

> **URL:** https://insightflowaihub.netlify.app  
> **Stack:** React 18 + TypeScript + Supabase + Ollama + Power BI Embedded  
> **Versão:** 1.0

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Páginas e Rotas](#2-páginas-e-rotas)
3. [Autenticação e Controle de Acesso](#3-autenticação-e-controle-de-acesso)
4. [Chat com IA — Geração de SQL](#4-chat-com-ia--geração-de-sql)
5. [Relatórios](#5-relatórios)
6. [Power BI Embarcado](#6-power-bi-embarcado)
7. [Histórico de Queries](#7-histórico-de-queries)
8. [Execuções](#8-execuções)
9. [Configurações do Usuário](#9-configurações-do-usuário)
10. [Painel Administrativo](#10-painel-administrativo)
11. [Configuração do Site (Super Admin)](#11-configuração-do-site-super-admin)
12. [Planos e Pagamentos](#12-planos-e-pagamentos)
13. [Segurança](#13-segurança)
14. [Integrações Externas](#14-integrações-externas)
15. [Stack Tecnológica](#15-stack-tecnológica)

---

## 1. Visão Geral

O **InsightFlow** é uma plataforma SaaS de inteligência de dados que permite transformar linguagem natural em consultas SQL executáveis, visualizar dashboards Power BI e exportar resultados — tudo com segurança enterprise e controle de acesso por aprovação.

**Principais diferenciais:**
- Geração automática de SQL a partir de linguagem natural (IA local via Ollama + provedores em nuvem)
- Suporte a múltiplos bancos de dados simultâneos (PostgreSQL, MySQL, SQL Server, Oracle)
- Dashboards Power BI embarcados com autenticação Azure AD segura
- Fluxo de aprovação de usuários com notificações por email
- Exportação de resultados em CSV, Excel e JSON
- Aplicativo PWA (Progressive Web App) — instalável em qualquer dispositivo

---

## 2. Páginas e Rotas

### Rotas Públicas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Landing Page | Apresentação do produto, features, planos e CTA |
| `/auth` | Autenticação | Login, cadastro, recuperação e redefinição de senha |
| `/plans` | Planos | Seleção de plano e checkout via Mercado Pago |

### Rotas Protegidas (usuário ativo e autenticado)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/dashboard` | Dashboard Home | Estatísticas gerais e atividade recente |
| `/dashboard/chat` | Chat com IA | Geração e execução de SQL por linguagem natural |
| `/dashboard/reports` | Relatórios | Templates pré-definidos e geração livre de relatórios |
| `/dashboard/powerbi` | Power BI | Dashboards embarcados com autenticação Azure AD |
| `/dashboard/history` | Histórico | Registro completo de todas as queries geradas |
| `/dashboard/executions` | Execuções | Resultados detalhados de todas as execuções |
| `/dashboard/settings` | Configurações | Perfil, senhas, conexões, API keys e Ollama |

### Rotas Admin (somente administradores)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/dashboard/admin` | Gestão de Usuários | Aprovação/rejeição/desativação de usuários |
| `/dashboard/site-config` | Config do Site | Provedores de IA, configurações globais e manutenção |
| `/admin/approve/:id` | Aprovação Individual | Fluxo de aprovação por link direto (via email) |
| `/admin/reject/:id` | Rejeição Individual | Fluxo de rejeição por link direto (via email) |

---

## 3. Autenticação e Controle de Acesso

### Cadastro e Login

- **Cadastro** com email, senha e nome completo
- **Login** com email e senha
- **Recuperação de senha** por email com link de redefinição
- **Redefinição de senha** com novo token seguro
- Validação de formulários via **Zod** (erros inline)

### Fluxo de Aprovação de Usuários

Todo novo cadastro passa por aprovação manual do administrador:

```
Usuário se cadastra
        ↓
Status: pending_approval
        ↓
Email de notificação enviado ao admin
        ↓
Admin aprova / rejeita
        ↓
    ┌───┴───┐
Aprovado   Rejeitado
    ↓          ↓
Status:    Status:
 active   rejected
    ↓          ↓
Acesso     Acesso
liberado   negado
```

### Estados do Usuário

| Status | Descrição | Acesso |
|--------|-----------|--------|
| `pending_approval` | Aguardando aprovação do admin | Bloqueado (tela de espera) |
| `active` | Aprovado e ativo | Acesso completo ao dashboard |
| `rejected` | Rejeitado pelo admin | Bloqueado (mensagem de negação) |

### Controle de Papéis (Roles)

- **user** — acesso padrão ao dashboard
- **admin** — acesso adicional ao painel de gestão e configuração do site

### Rotas Protegidas

O componente `ProtectedRoute` verifica:
1. Sessão ativa (usuário autenticado)
2. Status `active` no perfil
3. Papel `admin` para rotas administrativas

---

## 4. Chat com IA — Geração de SQL

**Rota:** `/dashboard/chat`

A funcionalidade principal do sistema: o usuário descreve em português o que precisa saber, e a IA gera a query SQL correspondente.

### Fluxo de Uso

1. Usuário digita uma pergunta em linguagem natural
2. A IA gera o SQL otimizado para o banco selecionado
3. O SQL é exibido com destaque de sintaxe
4. Usuário seleciona a conexão de banco de dados
5. O sistema executa a query e exibe os resultados em tabela

### Recursos

| Recurso | Descrição |
|---------|-----------|
| **Streaming** | Resposta da IA em tempo real (token a token) |
| **Seleção de conexão** | Dropdown com todas as conexões cadastradas |
| **Seleção de modelo** | Escolha entre modelos Ollama disponíveis |
| **Execução direta** | Botão para executar o SQL gerado |
| **Resultados em tabela** | Preview de até 20 linhas |
| **Copiar SQL** | Botão de cópia com feedback visual |
| **Parar geração** | Botão para interromper resposta da IA |
| **Sugestões** | Cards de perguntas sugeridas para novos usuários |
| **Histórico de chat** | Conversas anteriores na sessão |

### Segurança na Execução

- `validateSQL` — bloqueia queries que não sejam SELECT
- `sanitizeInput` — previne injeção via prompt
- `checkRateLimit` — limite de 15 execuções SQL a cada 0,5s e 20 mensagens a cada 2s
- Execução via **Supabase Edge Function** `execute-sql` (nunca direto do browser)

---

## 5. Relatórios

**Rota:** `/dashboard/reports`

Geração de SQL a partir de descrições livres ou templates pré-configurados.

### Templates Disponíveis

| Categoria | Templates |
|-----------|-----------|
| **Vendas** | Vendas Mensais, Top Produtos, Comissões, Funil de Vendas |
| **Financeiro** | DRE Simplificado, Fluxo de Caixa |
| **Clientes** | Retenção de Clientes, Segmentação RFM |

### Recursos

- Campo livre para descrever o relatório desejado
- Clique em template para preencher automaticamente a descrição
- Geração de SQL via Ollama
- **Copiar** e **Baixar** o SQL gerado
- Verificação de status do Ollama antes de gerar
- Seleção de modelo de IA

---

## 6. Power BI Embarcado

**Rota:** `/dashboard/powerbi`

Integração com a API do Power BI para embutir dashboards com autenticação segura via Azure AD.

### Configuração Necessária

| Campo | Descrição |
|-------|-----------|
| Azure AD Tenant ID | Identificador do tenant no Azure |
| Azure AD Client ID | ID do aplicativo registrado |
| Azure AD Client Secret | Segredo do aplicativo (armazenado criptografado) |
| Power BI Report ID | ID do relatório no workspace |
| Power BI Workspace ID | ID do workspace do Power BI |

### Funcionalidades

- **Adicionar dashboards** com URL de embed e credenciais
- **Múltiplos dashboards** com navegação por abas
- **Modo tela cheia** para apresentações
- **Refresh manual** dos dados
- **Geração de token** de embed via Power BI REST API
- **Controle de expiração** do token
- **Guia de configuração** em 4 passos dentro do sistema

### Segurança

- Credenciais Azure **nunca expostas no browser**
- Tokens gerados server-side via `POWERBI_TOKEN_URL`
- Dados não-sensíveis em localStorage (apenas nomes/URLs)
- Segredos armazenados criptografados no backend

---

## 7. Histórico de Queries

**Rota:** `/dashboard/history`

Registro completo de todas as queries geradas pelo usuário.

### Informações Registradas

| Campo | Descrição |
|-------|-----------|
| Prompt original | Pergunta em linguagem natural |
| SQL gerado | Query completa com formatação |
| Modelo utilizado | Nome do modelo de IA |
| Tempo de execução | Duração em milissegundos |
| Data de criação | Timestamp da geração |

### Funcionalidades

- **Busca** por prompt ou conteúdo SQL
- **Painel de detalhes** lateral (lista + detalhe lado a lado)
- **Re-execução** de queries salvas com seleção de conexão
- **Exportação** dos resultados em CSV, Excel ou JSON
- Preview de resultados (até 20 linhas)

---

## 8. Execuções

**Rota:** `/dashboard/executions`

Detalhe completo de cada execução realizada — incluindo resultados e erros.

### Status de Execução

| Status | Indicador | Descrição |
|--------|-----------|-----------|
| Sucesso | 🟢 Verde | Query executada com resultado |
| Erro | 🔴 Vermelho | Falha na execução |

### Metadados Exibidos

- Nome e tipo da conexão (PostgreSQL, MySQL, etc.)
- Tempo de execução
- Contagem de linhas retornadas
- SQL completo com destaque de sintaxe
- Mensagem de erro (quando aplicável)

### Funcionalidades

- **Busca** por nome de conexão ou SQL
- **Tabela de resultados** com cabeçalhos e dados (até 100 linhas)
- **Re-executar** com conexão diferente
- **Exportar resultados** em CSV, Excel ou JSON
- **Excluir** execução do histórico

---

## 9. Configurações do Usuário

**Rota:** `/dashboard/settings`

Painel centralizado de configurações pessoais com 5 abas.

### Aba: Perfil

- Atualizar **nome completo**
- **Alterar senha** com verificação da senha atual

### Aba: Notificações

| Notificação | Descrição |
|-------------|-----------|
| Notificações por email | Receber updates gerais |
| Notificações de relatórios | Avisos sobre relatórios gerados |
| Alertas de segurança | Notificações de acesso e segurança |

### Aba: Conexões

Gerenciamento completo das conexões de banco de dados:

| Campo | Descrição |
|-------|-----------|
| Nome | Identificador amigável da conexão |
| Tipo | PostgreSQL, MySQL, SQL Server, Oracle |
| Host | Endereço do servidor |
| Porta | Porta de conexão |
| Banco de Dados | Nome do database |
| Usuário | Nome de usuário |
| Senha | Armazenada criptografada |

**Ações disponíveis:**
- Criar nova conexão
- Testar conectividade
- Editar conexão existente
- Excluir conexão

### Aba: API Keys

- **Gerar** nova API key (formato `sk_live_*`)
- **Copiar** com feedback visual
- **Revogar** chaves existentes
- **Mascaramento** da chave (apenas primeiros/últimos 4 caracteres visíveis)

### Aba: Ollama

| Configuração | Descrição |
|--------------|-----------|
| URL do Ollama | Endereço da instância local/remota |
| Modelo padrão | Modelo selecionado para geração SQL |
| Versão | Versão atual do Ollama instalado |
| Comandos rápidos | Comandos para pull/run de modelos |

---

## 10. Painel Administrativo

**Rota:** `/dashboard/admin` *(somente admin)*

Gerenciamento completo dos usuários da plataforma.

### Cards de Estatísticas

| Card | Cor | Descrição |
|------|-----|-----------|
| Aprovações Pendentes | 🟡 Amarelo | Usuários aguardando aprovação |
| Usuários Ativos | 🟢 Verde | Usuários com acesso liberado |
| Usuários Rejeitados | 🔴 Vermelho | Usuários com acesso negado |

### Tabela de Usuários

Colunas: Nome, Email, Data de Cadastro, Status

**Filtros:** Busca por email ou nome

### Ações por Status

| Status do Usuário | Ações Disponíveis |
|-------------------|-------------------|
| `pending_approval` | ✅ Aprovar / ❌ Rejeitar |
| `active` | 🚫 Desativar |
| `rejected` | ✅ Aprovar |

- **Diálogo de confirmação** antes de qualquer ação
- **Notificação por email** ao usuário em cada mudança de status
- **Botão de atualização** para recarregar a lista

---

## 11. Configuração do Site (Super Admin)

**Rota:** `/dashboard/site-config` *(somente admin)*

Painel de configuração global da plataforma com 3 abas.

### Aba: Provedores de IA

Configuração e gerenciamento dos modelos de IA disponíveis:

| Provedor | URL Base | Observações |
|----------|----------|-------------|
| **Ollama** | `http://localhost:11434` | LLM local, sem custo de API |
| **OpenAI** | `https://api.openai.com` | GPT-4, GPT-3.5, etc. |
| **Anthropic Claude** | `https://api.anthropic.com` | Claude 3, Claude 2 |
| **Google Gemini** | `https://generativelanguage.googleapis.com` | Gemini Pro, Flash |

**Por provedor:**
- Nome personalizado
- URL base
- Modelo padrão
- API Key (mascarada: primeiros/últimos 4 chars visíveis)
- Toggle de ativação/desativação
- Botão de teste de conexão com status em tempo real
- Editar e excluir

> **Segurança:** API Keys armazenadas em sessionStorage — nunca enviadas ao servidor, nunca expostas em logs

### Aba: Usuários

**Criação de usuário pelo admin:**
| Campo | Descrição |
|-------|-----------|
| Email | Endereço de email do novo usuário |
| Nome Completo | Nome de exibição |
| Papel | `user` (padrão) ou `admin` |
| Senha Temporária | Senha inicial (usuário deve alterar) |

**Políticas de aprovação:**
| Política | Descrição |
|----------|-----------|
| Exigir aprovação | Admin deve aprovar todo novo cadastro |
| Permitir auto-cadastro | Formulário de cadastro público habilitado |

### Aba: Site

| Configuração | Descrição |
|--------------|-----------|
| Nome do site | Exibido na interface |
| Descrição | Subtítulo/tagline do sistema |
| Email de suporte | Contato exibido para usuários |
| Modo manutenção | Bloqueia acesso temporariamente |
| Máx. usuários por plano | Limite de usuários por tier |

---

## 12. Planos e Pagamentos

**Rota:** `/plans`

### Planos Disponíveis

| | Mensal | Anual |
|---|--------|-------|
| **Preço** | R$ 99,00/mês | R$ 990,00/ano |
| **Equivalente** | — | ~R$ 82,50/mês |
| **Economia** | — | 2 meses grátis |
| **Suporte** | Padrão | Prioritário |

### Processamento de Pagamento

- **Gateway:** Mercado Pago
- **Fluxo:** Checkout via Supabase Edge Function `mercadopago-checkout`
- **Callbacks:** Tratamento de sucesso e falha com notificação Toast
- **Status:** Acompanhamento do status do pagamento pós-checkout

---

## 13. Segurança

### Proteção de Queries

| Mecanismo | Descrição |
|-----------|-----------|
| `validateSQL` | Bloqueia toda query que não seja SELECT |
| `sanitizeInput` | Sanitiza o prompt antes de enviar à IA |
| `checkRateLimit` | 15 execuções SQL/0,5s · 20 msgs/2s por usuário |
| Edge Function | Execução sempre server-side, nunca no browser |

### Proteção de Credenciais

| Dado | Armazenamento |
|------|--------------|
| Senhas de banco de dados | Criptografadas no Supabase |
| API Keys de IA | sessionStorage (nunca localStorage) |
| Credenciais Azure/Power BI | Criptografadas no backend |
| Senhas de usuário | Hash via Supabase Auth |

### Controle de Acesso

- Rotas protegidas com verificação de sessão
- Verificação de status `active` em toda navegação
- Rotas admin com verificação de papel `admin`
- Aprovação obrigatória de novos usuários

### Auditoria

- Histórico completo de queries geradas
- Histórico completo de execuções com resultados
- Registro de aprovações/rejeições de usuários
- Logs de erros de execução

---

## 14. Integrações Externas

### Supabase

| Recurso | Uso |
|---------|-----|
| **Auth** | Autenticação, sessões, reset de senha |
| **Database** | Perfis, conexões, histórico, execuções |
| **Edge Functions** | execute-sql, send-approval-email, mercadopago-checkout, admin-create-user |
| **RLS (Row Level Security)** | Isolamento de dados por usuário |

### Ollama (LLM Local)

- Geração de SQL a partir de linguagem natural
- Execução **local** (sem envio de dados para nuvem)
- Configuração de URL e modelo nas Settings
- Verificação de disponibilidade antes de usar

### Provedores de IA em Nuvem (opcionais)

- OpenAI (GPT-4, GPT-3.5)
- Anthropic Claude (Claude 3 Opus/Sonnet/Haiku)
- Google Gemini (Gemini Pro, Flash)

### Bancos de Dados Suportados

| Banco | Versões |
|-------|---------|
| PostgreSQL | 12+ |
| MySQL | 5.7+ / 8.0+ |
| SQL Server | 2016+ |
| Oracle | 12c+ |

### Power BI (Microsoft)

- API REST do Power BI para geração de tokens
- Azure AD para autenticação OAuth2
- Embed de relatórios com token renovável

### Mercado Pago

- Checkout Pro para assinaturas
- Callbacks de sucesso/falha
- Integração via Supabase Edge Function

---

## 15. Stack Tecnológica

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18 | Framework UI |
| TypeScript | 5 | Tipagem estática |
| Vite | 5 | Build e dev server |
| React Router | 6 | Roteamento SPA |
| Tailwind CSS | 3 | Estilização |
| Shadcn/ui | — | Componentes base |
| Framer Motion | — | Animações |
| Lucide React | — | Ícones |
| TanStack Query | 5 | Cache e estado de servidor |
| Zod | 3 | Validação de schemas |
| date-fns | — | Formatação de datas |

### Backend / Infraestrutura

| Tecnologia | Uso |
|------------|-----|
| Supabase | Auth + Database + Edge Functions |
| PostgreSQL | Banco de dados principal |
| Deno (Edge Functions) | Runtime das funções serverless |
| Netlify | Hospedagem e deploy do frontend |

### IA / LLM

| Tecnologia | Uso |
|------------|-----|
| Ollama | LLM local (SQL generation) |
| OpenAI API | Provedor alternativo |
| Anthropic API | Provedor alternativo |
| Google Gemini API | Provedor alternativo |

### PWA

- Service Worker para funcionamento offline
- Instalável em desktop e mobile
- Cache de assets estáticos

---

## Apêndice — Supabase Edge Functions

| Função | Método | Descrição |
|--------|--------|-----------|
| `execute-sql` | POST | Executa SELECT em banco externo via conexão criptografada |
| `send-approval-email` | POST | Envia email de aprovação/rejeição ao usuário |
| `mercadopago-checkout` | POST | Inicia checkout de assinatura no Mercado Pago |
| `admin-create-user` | POST | Cria usuário com papel específico (admin only) |

---

*Documento gerado automaticamente — InsightFlow v1.0 · https://insightflowaihub.netlify.app*
