# 💬 Talk Chat - Chat em Tempo Real

Aplicação web de chat em tempo real similar ao Discord, construída com React e Socket.io.

## 🚀 Funcionalidades

- ✅ **Chat de voz em tempo real** com WebRTC (tipo TeamSpeak/Discord)
- ✅ Chat de texto em tempo real com WebSocket
- ✅ Múltiplas salas/canais
- ✅ Lista de usuários online
- ✅ Indicador visual de quem está falando
- ✅ Controles de microfone e áudio
- ✅ Detecção automática de fala
- ✅ Indicador de digitação ("está digitando...")
- ✅ Notificações de entrada/saída de usuários
- ✅ Interface moderna e responsiva
- ✅ Design mobile-friendly

## 🛠️ Tecnologias

- **Frontend**: React 18
- **Backend**: Node.js + Express
- **WebSocket**: Socket.io (para sinalização e chat de texto)
- **WebRTC**: Para transmissão de áudio peer-to-peer em tempo real
- **Estilização**: CSS3

## 📦 Instalação Local

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn

### Passo a passo

1. **Clone o repositório** (ou baixe os arquivos)

2. **Instale as dependências do servidor:**
```bash
cd server
npm install
```

3. **Instale as dependências do cliente:**
```bash
cd ../client
npm install
```

4. **Inicie o servidor:**
```bash
cd ../server
npm start
```
O servidor rodará em `http://localhost:4000`

5. **Em outro terminal, inicie o cliente:**
```bash
cd client
npm start
```
O cliente abrirá automaticamente em `http://localhost:3000` (React usa porta 3000 por padrão, mas se conecta ao servidor na porta 4000)

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

