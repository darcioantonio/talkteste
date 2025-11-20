const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// Configurar CORS para Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Armazenar dados em memória
const users = new Map(); // socketId -> { username, currentChannel, isMuted, pushToTalk }
const channels = new Map(); // channelId -> { name, users: Set<socketId>, messages: [] }
const channelUsers = new Map(); // channelId -> Set<socketId>

// Criar 10 canais fixos
const CHANNELS = [
  { id: 'geral', name: 'Geral', isGlobal: true },
  { id: 'canal-1', name: 'Canal 1', isGlobal: false },
  { id: 'canal-2', name: 'Canal 2', isGlobal: false },
  { id: 'canal-3', name: 'Canal 3', isGlobal: false },
  { id: 'canal-4', name: 'Canal 4', isGlobal: false },
  { id: 'canal-5', name: 'Canal 5', isGlobal: false },
  { id: 'canal-6', name: 'Canal 6', isGlobal: false },
  { id: 'canal-7', name: 'Canal 7', isGlobal: false },
  { id: 'canal-8', name: 'Canal 8', isGlobal: false },
  { id: 'canal-9', name: 'Canal 9', isGlobal: false },
];

// Inicializar canais
CHANNELS.forEach(channel => {
  channels.set(channel.id, {
    id: channel.id,
    name: channel.name,
    isGlobal: channel.isGlobal,
    users: new Set(),
    messages: []
  });
  channelUsers.set(channel.id, new Set());
});

// Rota para obter canais
app.get('/api/channels', (req, res) => {
  res.json({ channels: CHANNELS });
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    users: users.size,
    channels: channels.size
  });
});

// Servir arquivos estáticos do frontend (quando buildado) - DEPOIS das rotas da API
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  const indexPath = path.join(clientBuildPath, 'index.html');
  
  // Verificar se o diretório build existe
  if (fs.existsSync(clientBuildPath) && fs.existsSync(indexPath)) {
    // Servir arquivos estáticos (JS, CSS, imagens, etc.)
    app.use(express.static(clientBuildPath));
    
    // Servir index.html para todas as rotas que não são da API
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
        res.sendFile(indexPath);
      }
    });
  } else {
    console.warn(`⚠️  Diretório de build não encontrado em: ${clientBuildPath}`);
    console.warn('⚠️  Certifique-se de que o build do cliente foi executado antes do deploy.');
    
    // Rota fallback quando o build não existe
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
        res.status(500).send(`
          <html>
            <head><title>Erro de Build</title></head>
            <body style="font-family: Arial; padding: 40px; text-align: center;">
              <h1>⚠️ Erro: Build do cliente não encontrado</h1>
              <p>O diretório de build do cliente não foi encontrado.</p>
              <p><strong>Verifique se o Build Command está configurado corretamente no Render.</strong></p>
            </body>
          </html>
        `);
      }
    });
  }
}

// Eventos Socket.io
io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  // Usuário entra no sistema
  socket.on('user-join', (data) => {
    const { username } = data;
    
    if (!username || username.trim().length === 0) {
      socket.emit('error', { message: 'Username é obrigatório' });
      return;
    }

    // Armazenar usuário
    users.set(socket.id, {
      username: username.trim(),
      currentChannel: 'geral', // Começa no canal geral
      isMuted: false,
      pushToTalk: false,
      pushToTalkKey: null
    });

    // Entrar no canal geral
    const channel = channels.get('geral');
    channel.users.add(socket.id);
    channelUsers.get('geral').add(socket.id);
    socket.join('geral');

    // Notificar outros no canal
    socket.to('geral').emit('user-joined-channel', {
      username: username.trim(),
      channelId: 'geral',
      socketId: socket.id
    });

    // Enviar lista de usuários no canal
    const channelUsersList = Array.from(channelUsers.get('geral'))
      .map(id => {
        const user = users.get(id);
        return user ? { socketId: id, username: user.username } : null;
      })
      .filter(Boolean);

    socket.emit('users-in-channel', {
      channelId: 'geral',
      users: channelUsersList
    });

    // Enviar mensagens do canal
    socket.emit('channel-messages', {
      channelId: 'geral',
      messages: channel.messages.slice(-50) // Últimas 50 mensagens
    });

    // Notificar todos os canais sobre novo usuário
    io.emit('user-online', {
      socketId: socket.id,
      username: username.trim()
    });

    console.log(`${username} entrou no sistema`);
  });

  // Trocar de canal
  socket.on('switch-channel', (data) => {
    const { channelId } = data;
    const user = users.get(socket.id);
    
    if (!user) {
      socket.emit('error', { message: 'Usuário não encontrado' });
      return;
    }

    const channel = channels.get(channelId);
    if (!channel) {
      socket.emit('error', { message: 'Canal não encontrado' });
      return;
    }

    // Sair do canal atual
    const oldChannel = channels.get(user.currentChannel);
    if (oldChannel) {
      oldChannel.users.delete(socket.id);
      channelUsers.get(user.currentChannel).delete(socket.id);
      socket.leave(user.currentChannel);
      
      socket.to(user.currentChannel).emit('user-left-channel', {
        username: user.username,
        channelId: user.currentChannel,
        socketId: socket.id
      });
    }

    // Entrar no novo canal
    user.currentChannel = channelId;
    channel.users.add(socket.id);
    channelUsers.get(channelId).add(socket.id);
    socket.join(channelId);

    // Notificar outros no novo canal
    socket.to(channelId).emit('user-joined-channel', {
      username: user.username,
      channelId,
      socketId: socket.id
    });

    // Enviar lista de usuários no novo canal
    const channelUsersList = Array.from(channelUsers.get(channelId))
      .map(id => {
        const u = users.get(id);
        return u ? { socketId: id, username: u.username } : null;
      })
      .filter(Boolean);

    socket.emit('users-in-channel', {
      channelId,
      users: channelUsersList
    });

    // Enviar mensagens do canal
    socket.emit('channel-messages', {
      channelId,
      messages: channel.messages.slice(-50)
    });

    console.log(`${user.username} trocou para o canal ${channelId}`);
  });

  // Enviar mensagem de texto
  socket.on('send-message', (data) => {
    const { channelId, content } = data;
    const user = users.get(socket.id);
    
    if (!user) {
      socket.emit('error', { message: 'Usuário não encontrado' });
      return;
    }

    if (!content || content.trim().length === 0) {
      return;
    }

    const channel = channels.get(channelId);
    if (!channel) {
      socket.emit('error', { message: 'Canal não encontrado' });
      return;
    }

    // Verificar se pode enviar mensagem
    // Canal geral: pode enviar de qualquer lugar
    // Outros canais: precisa estar no canal
    if (!channel.isGlobal && user.currentChannel !== channelId) {
      socket.emit('error', { message: 'Você precisa estar no canal para enviar mensagens' });
      return;
    }

    const message = {
      id: Date.now().toString() + Math.random().toString(36),
      username: user.username,
      content: content.trim(),
      channelId,
      timestamp: new Date().toISOString(),
      socketId: socket.id
    };

    // Salvar mensagem (máximo 100 por canal)
    channel.messages.push(message);
    if (channel.messages.length > 100) {
      channel.messages.shift();
    }

    // Enviar para todos no canal (ou todos se for geral)
    if (channel.isGlobal) {
      io.emit('receive-message', message);
    } else {
      io.to(channelId).emit('receive-message', message);
    }

    console.log(`Mensagem de ${user.username} no canal ${channelId}: ${content}`);
  });

  // Indicador de digitação
  socket.on('typing', (data) => {
    const { channelId, isTyping } = data;
    const user = users.get(socket.id);
    if (!user) return;

    if (channelId === 'geral') {
      socket.broadcast.emit('user-typing', {
        username: user.username,
        channelId,
        isTyping,
        socketId: socket.id
      });
    } else {
      socket.to(channelId).emit('user-typing', {
        username: user.username,
        channelId,
        isTyping,
        socketId: socket.id
      });
    }
  });

  // Configurar push-to-talk
  socket.on('set-push-to-talk', (data) => {
    const { enabled, key } = data;
    const user = users.get(socket.id);
    
    if (!user) return;

    user.pushToTalk = enabled;
    user.pushToTalkKey = key || null;

    socket.emit('push-to-talk-updated', {
      enabled,
      key: user.pushToTalkKey
    });
  });

  // Push-to-talk: falar
  socket.on('push-to-talk-start', () => {
    const user = users.get(socket.id);
    if (!user || !user.pushToTalk || user.isMuted) return;

    const channel = channels.get(user.currentChannel);
    if (!channel) return;

    // Notificar que está falando
    socket.to(user.currentChannel).emit('user-speaking', {
      username: user.username,
      socketId: socket.id,
      isSpeaking: true,
      channelId: user.currentChannel
    });
  });

  // Push-to-talk: parar de falar
  socket.on('push-to-talk-stop', () => {
    const user = users.get(socket.id);
    if (!user) return;

    socket.to(user.currentChannel).emit('user-speaking', {
      username: user.username,
      socketId: socket.id,
      isSpeaking: false,
      channelId: user.currentChannel
    });
  });

  // Mutar/desmutar microfone
  socket.on('toggle-mute', (data) => {
    const { muted } = data;
    const user = users.get(socket.id);
    
    if (!user) return;

    user.isMuted = muted;

    socket.emit('mute-updated', { muted });
  });

  // WebRTC - Sinalização para áudio
  socket.on('webrtc-offer', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    if (data.to) {
      io.to(data.to).emit('webrtc-offer', {
        offer: data.offer,
        from: socket.id,
        username: user.username
      });
    } else {
      socket.to(user.currentChannel).emit('webrtc-offer', {
        offer: data.offer,
        from: socket.id,
        username: user.username
      });
    }
  });

  socket.on('webrtc-answer', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    if (data.to) {
      io.to(data.to).emit('webrtc-answer', {
        answer: data.answer,
        from: socket.id,
        username: user.username
      });
    }
  });

  socket.on('webrtc-ice-candidate', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    if (data.to) {
      io.to(data.to).emit('webrtc-ice-candidate', {
        candidate: data.candidate,
        from: socket.id,
        username: user.username
      });
    } else {
      socket.to(user.currentChannel).emit('webrtc-ice-candidate', {
        candidate: data.candidate,
        from: socket.id,
        username: user.username
      });
    }
  });

  // Usuário desconecta
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    
    if (user) {
      // Remover de todos os canais
      channels.forEach((channel, channelId) => {
        channel.users.delete(socket.id);
        channelUsers.get(channelId).delete(socket.id);
      });

      // Notificar todos
      io.emit('user-offline', {
        socketId: socket.id,
        username: user.username
      });

      // Notificar canais que o usuário saiu
      socket.broadcast.emit('user-left-channel', {
        username: user.username,
        channelId: user.currentChannel,
        socketId: socket.id
      });

      users.delete(socket.id);
      console.log(`${user.username} desconectou`);
    }
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Canais disponíveis: ${CHANNELS.length}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
