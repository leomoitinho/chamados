# 🎫 DeskMaster — Sistema de Chamados Multi-Empresas (Multi-Tenant)

Sistema completo e profissional de Gestão de Chamados (Help Desk / Service Desk) desenvolvido com **FastAPI (Python)**, **MySQL**, **React (Web/Desktop Ready)** e **React Native (Android Ready)**.

---

## 🏛️ Arquitetura & Multi-Tenancy

O sistema implementa **Isolamento Multi-Tenant Estrito** com controle de acesso baseado em papéis (**RBAC**):

```
                                  ┌────────────────────────┐
                                  │   SUPER_ADMIN (Geral)  │
                                  │ (Vê tudo de todas emp.)│
                                  └───────────┬────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
       ┌─────────────────────────┐                         ┌─────────────────────────┐
       │ Empresa A: Tech Sol.    │                         │ Empresa B: Acme Logíst. │
       ├─────────────────────────┤                         ├─────────────────────────┤
       │ • COMPANY_ADMIN         │                         │ • COMPANY_ADMIN         │
       │   (Cria users p/ Emp A) │                         │   (Cria users p/ Emp B) │
       │ • COMPANY_USER          │                         │ • COMPANY_USER          │
       │   (Abre chamados Emp A) │                         │   (Abre chamados Emp B) │
       │ • Chamados da Emp A     │                         │ • Chamados da Emp B     │
       └─────────────────────────┘                         └─────────────────────────┘
```

### 👥 Matriz de Permissões:
1. **👑 Super Administrador Geral (`SUPER_ADMIN`)**:
   - Visualiza e gerencia chamados de **todas as empresas**.
   - Cria, edita e desativa **empresas** e **usuários de qualquer organização**.
   - Atribui ou assume chamados como técnico responsável em qualquer tenant.
   - Painel analítico global com comparativo de SLAs e volume de tickets por organização.
2. **🏢 Administrador da Empresa (`COMPANY_ADMIN`)**:
   - Visualiza todos os chamados da **sua própria empresa**.
   - **Pode cadastrar e gerenciar novos usuários e técnicos para a sua empresa**.
   - Atribui técnicos aos chamados da sua empresa.
   - Não possui acesso a dados de outras organizações (isolamento 100% garantido).
3. **👤 Usuário / Solicitante (`COMPANY_USER`)**:
   - Cria, acompanha e responde chamados da sua própria empresa.
   - Filtra rapidamente os próprios chamados no botão "Apenas Meus".
   - **Não pode criar ou alterar outros usuários** (gerencia apenas seu próprio perfil e senha).

---

## 🚀 Novas Funcionalidades Recentes

- 🛠️ **Atribuição & Desatribuição Dinâmica de Técnicos**:
  - Atribuição de responsável diretamente no modal de criação (`NewTicketModal`) ou na tela de detalhes do chamado (`TicketDetailModal`).
  - Suporte completo a desatribuir técnicos (retornando para "Não Atribuído") com feedback visual instantâneo.
- 📊 **Dashboard Interativo com Cliques Filtrados**:
  - Cliques em cards de métricas (Total, Abertos, Em Andamento, Pendentes, Resolvidos, Urgentes) redirecionam direto para o painel de chamados com os filtros aplicados.
  - Tabela Multi-Tenant de empresas permite ao Super Admin clicar em qualquer empresa e visualizar os chamados daquela organização específica.
- 🚨 **Alerta de SLA Estourado & Notificação de Chamados Atribuídos**:
  - Banners de alerta visual no topo do Dashboard notificando chamados atribuídos ao usuário logado e chamados em atraso crítico de SLA (Urgente: 4h, Alta: 24h, Média: 48h, Baixa: 72h).
- 🔍 **Filtro Inteligente "Apenas Meus"**:
  - Filtra instantaneamente chamados onde o usuário logado é o **solicitante** ou o **técnico responsável**.

---

## 📁 Estrutura do Repositório

```
chamados/
├── backend/                  # API REST em FastAPI + SQLAlchemy + MySQL
│   ├── app/
│   │   ├── core/             # Configurações .env, Conexão MySQL, Segurança JWT
│   │   ├── models/           # Company, User, Ticket, Comment, Category
│   │   ├── schemas/          # Schemas Pydantic v2
│   │   ├── api/              # Endpoints v1 com RBAC, SLA e regras de Tenant
│   │   ├── db_seed.py        # Script inicial para semear banco de dados
│   │   └── main.py           # Ponto de entrada FastAPI com CORS e Swagger UI
│   ├── requirements.txt
│   ├── .env.example
│   └── nginx.conf.example    # Exemplo pronto para rodar com Django existente
│
├── frontend-web/             # Dashboard Web & Desktop em React + Vite + Tailwind
│   ├── src/
│   │   ├── components/       # Kanban, TicketCard, Modais, Sidebar, Navbar
│   │   ├── pages/            # Login, Dashboard, Chamados, Usuários, Empresas, Perfil
│   │   ├── context/          # AuthContext com persistência JWT
│   │   └── services/         # Axios API client
│   ├── package.json
│   └── vite.config.ts
│
└── mobile/                   # Aplicativo React Native (Android / Expo)
    ├── src/
    │   ├── screens/          # Login, Home, Lista de Chamados, Detalhes/Timeline, Novo Chamado, Perfil
    │   ├── context/          # AuthContext com AsyncStorage
    │   └── services/         # API Client Mobile
    ├── App.tsx
    ├── app.json
    └── package.json
```

---

## ⚡ Como Rodar o Backend (FastAPI + MySQL)

1. **Ative o ambiente virtual e instale as dependências:**
   ```bash
   cd backend
   source ../venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure o arquivo `.env` (caso necessário):**
   ```env
   DATABASE_URL=mysql+pymysql://chamados_user:chamados_pass_2026@localhost:3306/chamados_test_db?charset=utf8mb4
   ```

3. **Popule o banco com dados de teste:**
   ```bash
   export PYTHONPATH=.
   python app/db_seed.py
   ```

4. **Inicie o servidor FastAPI:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - Swagger / Documentação Interativa: `http://localhost:8000/docs`

---

## 🌐 Como Rodar o Frontend Web (React + Vite + Tailwind)

1. **Instale os pacotes e inicie o ambiente de desenvolvimento:**
   ```bash
   cd frontend-web
   npm install
   npm run dev
   ```
   - Acesse no navegador: `http://localhost:5173`

2. **Gerar Build de Produção (para deploy no Nginx):**
   ```bash
   npm run build
   # Arquivos estáticos gerados em: frontend-web/dist/
   ```

---

## 📱 Como Rodar o Aplicativo Mobile (React Native / Android)

1. **Inicie o servidor Expo:**
   ```bash
   cd mobile
   npm start
   ```
2. Abra no aplicativo **Expo Go** no seu celular Android ou execute no emulador com `npm run android`.

---

## 🔑 Credenciais Pré-Cadastradas para Teste

| Perfil | E-mail | Senha | Acesso / Permissão |
| :--- | :--- | :--- | :--- |
| **👑 Super Admin Geral** | `superadmin@chamados.com` | `admin123` | Visão Global (todas empresas e relatórios) |
| **🏢 Admin Empresa 1** | `admin.tech@empresa1.com` | `admin123` | Cria usuários e gerencia chamados da Empresa 1 |
| **👤 Usuário Empresa 1** | `mariana.vendas@empresa1.com` | `user123` | Abre chamados na Empresa 1 (não cria usuários) |
| **🏢 Admin Empresa 2** | `admin.acme@empresa2.com` | `admin123` | Gerencia usuários e chamados da Empresa 2 |
| **👤 Usuário Empresa 2** | `carlos.operacoes@empresa2.com` | `user123` | Abre chamados na Empresa 2 |

---

## 🚀 Como Rodar no Mesmo Servidor com Django Existente (Nginx)

Consulte o arquivo [`backend/nginx.conf.example`](file:///home/leonardo/projetos/chamados/backend/nginx.conf.example) para configurar o Nginx de modo que o **React** seja servido como arquivos estáticos de alta performance e o **FastAPI** responda em `/api/`, enquanto seu **Django** continua funcionando intacto em sua porta/socket atual.
