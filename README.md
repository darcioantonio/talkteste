# 💬 TalkChat - Discord Clone Completo

Aplicação web completa estilo Discord com chat de voz e texto em tempo real, servidores, canais, autenticação e muito mais!

## 🚀 Funcionalidades

### ✨ Sistema Completo
- ✅ **Sistema de autenticação** (registro, login, JWT)
- ✅ **Servidores** (criar, gerenciar, deletar)
- ✅ **Canais de texto** (múltiplos canais por servidor)
- ✅ **Canais de voz** com slots limitados
- ✅ **Canais privados** (acesso restrito)
- ✅ **Sistema de permissões** (owner, admin, member)
- ✅ **Chat de texto em tempo real** com Socket.io
- ✅ **Chat de voz em tempo real** com WebRTC
- ✅ **Indicadores visuais** (quem está falando, status online)
- ✅ **Interface estilo Discord** (cores, design, UX)
- ✅ **Lista de membros** com status
- ✅ **Histórico de mensagens**

### 🎨 Design Profissional
- Interface 100% baseada no Discord
- Cores e temas idênticos
- Animações suaves
- Responsivo e moderno

## 🛠️ Tecnologias

- **Frontend**: React 18
- **Backend**: Node.js + Express
- **Banco de Dados**: MongoDB (Mongoose)
- **Autenticação**: JWT (jsonwebtoken)
- **WebSocket**: Socket.io (chat em tempo real)
- **WebRTC**: Transmissão de áudio peer-to-peer
- **Estilização**: CSS3 (estilo Discord)

## 📦 Instalação Local

### Pré-requisitos
- Node.js 16+ instalado
- MongoDB instalado localmente OU conta no MongoDB Atlas (gratuito)
- npm ou yarn

### Passo a passo

1. **Clone o repositório** (ou baixe os arquivos)

2. **Configure as variáveis de ambiente:**
   
   Crie um arquivo `.env` na pasta `server/`:
   ```env
   PORT=4000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/talkchat
   JWT_SECRET=seu-secret-key-aqui
   FRONTEND_URL=http://localhost:3000
   ```

   **OU** use MongoDB Atlas (recomendado):
   ```env
   MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/talkchat
   ```

3. **Instale as dependências do servidor:**
```bash
cd server
npm install
```

4. **Instale as dependências do cliente:**
```bash
cd ../client
npm install
```

5. **Inicie o MongoDB** (se usando local):
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
# ou
mongod
```

6. **Inicie o servidor:**
```bash
cd server
npm start
```
O servidor rodará em `http://localhost:4000`

7. **Em outro terminal, inicie o cliente:**
```bash
cd client
npm start
```
O cliente abrirá automaticamente em `http://localhost:3000`

## 🌐 Deploy no Render.com

### Configuração do Backend

1. Acesse [Render.com](https://render.com) e crie uma conta
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: `talk-chat-server` (ou qualquer nome)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Adicione variável de ambiente:
   - **Key**: `NODE_ENV`
   - **Value**: `production`

6. Clique em "Create Web Service"

### Configuração do Frontend

1. No Render, clique em "New +" → "Static Site"
2. Conecte o mesmo repositório
3. Configure:
   - **Name**: `talk-chat-client`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. Adicione variável de ambiente:
   - **Key**: `REACT_APP_SERVER_URL`
   - **Value**: `https://seu-backend.onrender.com` (URL do seu backend no Render)

5. Clique em "Create Static Site"

### ⚠️ Importante

Após criar o frontend, você precisa:
1. Copiar a URL do frontend (ex: `https://talk-chat-client.onrender.com`)
2. Voltar ao backend no Render
3. Adicionar/atualizar variável de ambiente:
   - **Key**: `FRONTEND_URL`
   - **Value**: URL do seu frontend

4. Fazer o mesmo no frontend, atualizando `REACT_APP_SERVER_URL` com a URL correta do backend

## 📁 Estrutura do Projeto

```
Talk_Chat/
├── server/
│   ├── index.js          # Servidor Express + Socket.io
│   └── package.json
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatRoom.js
│   │   │   ├── LoginForm.js
│   │   │   ├── MessageList.js
│   │   │   ├── MessageInput.js
│   │   │   └── UsersList.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🎯 Como Usar

1. Abra a aplicação no navegador
2. Digite seu nome e escolha uma sala
3. Clique em "Entrar no Chat"
4. **Para falar**: Clique no botão do microfone 🎤 para ativar
5. Fale normalmente - o áudio será transmitido em tempo real
6. Use o botão 🔊 para ligar/desligar o áudio dos outros
7. Você também pode enviar mensagens de texto enquanto fala!

### ⚠️ Permissões do Navegador

- **Microfone**: O navegador pedirá permissão para acessar o microfone
- **HTTPS**: Para funcionar em produção, é necessário HTTPS (o Render.com fornece isso automaticamente)
- **Navegadores suportados**: Chrome, Firefox, Edge, Safari (versões recentes)

## 🔧 Scripts Disponíveis

### Servidor
- `npm start` - Inicia o servidor
- `npm run dev` - Inicia com nodemon (auto-reload)

### Cliente
- `npm start` - Inicia em modo desenvolvimento
- `npm run build` - Cria build de produção

## 📝 Notas

- O servidor pode "dormir" após 15 minutos de inatividade no plano gratuito do Render
- A primeira requisição após o sleep pode demorar alguns segundos
- Para produção, considere usar um plano pago ou outra plataforma

## 🐛 Troubleshooting

**Problema**: Mensagens não aparecem em tempo real
- Verifique se o WebSocket está habilitado no Render
- Confirme que as URLs estão corretas nas variáveis de ambiente

**Problema**: Erro de CORS
- Verifique a variável `FRONTEND_URL` no backend
- Certifique-se de que o frontend está acessando a URL correta do backend

## 📄 Licença

Este projeto é open source e está disponível para uso livre.

---

Desenvolvido com ❤️ para comunicação em tempo real

