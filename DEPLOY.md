# 🚀 Guia de Deploy no Render.com

Este guia vai te ajudar a colocar o Talk Chat online no Render.com passo a passo.

## 📋 Pré-requisitos

1. Conta no GitHub (gratuita)
2. Conta no Render.com (gratuita)
3. Código do projeto commitado no GitHub

## 📝 Passo 1: Preparar o Código no GitHub

### 1.1 Criar repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"+"** no canto superior direito → **"New repository"**
3. Preencha:
   - **Repository name**: `talk-chat` (ou qualquer nome)
   - **Description**: "Chat de voz em tempo real"
   - **Visibility**: Público ou Privado (sua escolha)
   - **NÃO marque** "Initialize with README" (já temos um)
4. Clique em **"Create repository"**

### 1.2 Fazer upload do código

**Opção A - Via Git (recomendado):**

```bash
# No terminal, na pasta do projeto
cd C:\Users\Darcio\Desktop\Talk_Chat

# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - Talk Chat"

# Adicionar o repositório remoto (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/talk-chat.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

**Opção B - Via Interface do GitHub:**

1. No GitHub, após criar o repositório, você verá instruções
2. Arraste e solte a pasta do projeto na página do GitHub
3. Ou use o GitHub Desktop

## 🌐 Passo 2: Deploy do Backend no Render

### 2.1 Criar Web Service

1. Acesse [render.com](https://render.com) e faça login (pode usar conta GitHub)
2. Clique no botão **"New +"** no dashboard
3. Selecione **"Web Service"**

### 2.2 Conectar Repositório

1. Se for a primeira vez, clique em **"Connect account"** e autorize o GitHub
2. Selecione o repositório `talk-chat` que você criou
3. Clique em **"Connect"**

### 2.3 Configurar o Backend

Preencha os campos:

- **Name**: `talk-chat-server` (ou qualquer nome)
- **Region**: Escolha a mais próxima (ex: `Oregon (US West)`)
- **Branch**: `main` (ou `master`)
- **Root Directory**: `server` ⚠️ **IMPORTANTE**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: **Free** (para começar)

### 2.4 Variáveis de Ambiente do Backend

Na seção **"Environment Variables"**, adicione:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |

### 2.5 Criar o Serviço

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (pode levar 2-5 minutos)
3. **Anote a URL** que será gerada (ex: `https://talk-chat-server.onrender.com`)

⚠️ **Importante**: No plano gratuito, o servidor "dorme" após 15 minutos de inatividade. A primeira requisição após dormir pode demorar alguns segundos.

## 🎨 Passo 3: Deploy do Frontend no Render

### 3.1 Criar Static Site

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Static Site"**

### 3.2 Conectar Repositório

1. Selecione o mesmo repositório `talk-chat`
2. Clique em **"Connect"**

### 3.3 Configurar o Frontend

Preencha os campos:

- **Name**: `talk-chat-client` (ou qualquer nome)
- **Branch**: `main` (ou `master`)
- **Root Directory**: `client` ⚠️ **IMPORTANTE**
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Plan**: **Free**

### 3.4 Variáveis de Ambiente do Frontend

Na seção **"Environment Variables"**, adicione:

| Key | Value |
|-----|-------|
| `REACT_APP_SERVER_URL` | `https://SEU-BACKEND.onrender.com` |

⚠️ **Substitua** `SEU-BACKEND.onrender.com` pela URL real do seu backend que você anotou no passo 2.5!

### 3.5 Criar o Site

1. Clique em **"Create Static Site"**
2. Aguarde o build e deploy (pode levar 3-5 minutos)
3. **Anote a URL** do frontend (ex: `https://talk-chat-client.onrender.com`)

## 🔗 Passo 4: Conectar Frontend e Backend

### 4.1 Atualizar Backend

1. Volte para o serviço do backend no Render
2. Vá em **"Environment"**
3. Adicione/atualize a variável:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://SEU-FRONTEND.onrender.com` |

⚠️ **Substitua** pela URL real do seu frontend!

4. Clique em **"Save Changes"**
5. O servidor vai reiniciar automaticamente

### 4.2 Verificar Frontend

1. Vá no serviço do frontend
2. Verifique se a variável `REACT_APP_SERVER_URL` está correta
3. Se precisar alterar, edite e salve (vai fazer rebuild)

## ✅ Passo 5: Testar

1. Acesse a URL do frontend (ex: `https://talk-chat-client.onrender.com`)
2. Abra em duas abas/janelas diferentes
3. Entre na mesma sala com nomes diferentes
4. Teste o chat de voz e texto!

## 🔧 Troubleshooting (Solução de Problemas)

### Problema: "Cannot connect to server"

**Solução:**
- Verifique se `REACT_APP_SERVER_URL` no frontend está correto
- Verifique se o backend está rodando (veja os logs no Render)
- Aguarde alguns segundos se o servidor estava "dormindo"

### Problema: Microfone não funciona

**Solução:**
- Verifique se está usando HTTPS (Render fornece automaticamente)
- Verifique as permissões do navegador
- Alguns navegadores bloqueiam WebRTC em HTTP (só funciona em HTTPS)

### Problema: Erro de CORS

**Solução:**
- Verifique se `FRONTEND_URL` no backend está correto
- Certifique-se de que a URL não tem barra no final

### Problema: Build falha

**Solução:**
- Verifique os logs de build no Render
- Certifique-se de que `Root Directory` está correto
- Verifique se todas as dependências estão no `package.json`

## 📊 Monitoramento

### Ver Logs

1. No dashboard do Render, clique no seu serviço
2. Vá na aba **"Logs"**
3. Você verá logs em tempo real

### Health Check

O backend tem um endpoint de health check:
- `https://SEU-BACKEND.onrender.com/api/health`

Acesse no navegador para verificar se está funcionando.

## 💡 Dicas

1. **Domínio Personalizado**: No Render você pode adicionar um domínio próprio (gratuito)
2. **Auto-Deploy**: Por padrão, qualquer push no GitHub faz deploy automático
3. **Logs**: Use os logs para debugar problemas
4. **Variáveis de Ambiente**: Nunca commite senhas ou chaves no código, use variáveis de ambiente

## 🎉 Pronto!

Seu chat de voz está online! Compartilhe a URL do frontend com seus amigos e comece a conversar!

---

**Precisa de ajuda?** Verifique os logs no Render ou consulte a documentação em [render.com/docs](https://render.com/docs)

