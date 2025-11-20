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

// Servir arquivos estáticos do frontend (quando buildado)
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  const indexPath = path.join(clientBuildPath, 'index.html');
  
  // Verificar se o diretório build existe
  if (fs.existsSync(clientBuildPath) && fs.existsSync(indexPath)) {
    app.use(express.static(clientBuildPath));
    
    app.get('*', (req, res) => {
      res.sendFile(indexPath);
    });
  } else {
    console.warn(`⚠️  Diretório de build não encontrado em: ${clientBuildPath}`);
    console.warn('⚠️  Certifique-se de que o build do cliente foi executado antes do deploy.');
  }
}

// Armazenar usuários conectados
const users = new Map();
const rooms = new Map();

// Eventos Socket.io
io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  // Usuário entra no chat
  socket.on('user-joined', (data) => {
    const { username, room } = data;
    
    // Armazenar informações do usuário
    users.set(socket.id, { username, room, socketId: socket.id });
    
    // Entrar na sala
    socket.join(room);
    
    // Adicionar usuário à lista da sala
    if (!rooms.has(room)) {
      rooms.set(room, new Set());
    }
    rooms.get(room).add(socket.id);
    
    // Notificar outros usuários
    socket.to(room).emit('user-joined-room', {
      username,
      message: `${username} entrou no chat`,
      timestamp: new Date().toISOString()
    });
    
    // Enviar lista de usuários online na sala
    const roomUsers = Array.from(rooms.get(room))
      .map(id => users.get(id))
      .filter(u => u !== undefined);
    
    io.to(room).emit('users-in-room', roomUsers);
    
    console.log(`${username} entrou na sala: ${room}`);
  });

  // Receber mensagem
  socket.on('send-message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    const messageData = {
      id: Date.now().toString(),
      username: user.username,
      message: data.message,
      room: user.room,
      timestamp: new Date().toISOString()
    };
    
    // Enviar mensagem para todos na sala
    io.to(user.room).emit('receive-message', messageData);
    console.log(`Mensagem de ${user.username} em ${user.room}: ${data.message}`);
  });

  // Indicador de digitação
  socket.on('typing', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    socket.to(user.room).emit('user-typing', {
      username: user.username,
      isTyping: data.isTyping
    });
  });

  // WebRTC - Sinalização para áudio
  socket.on('webrtc-offer', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    // Se tem destinatário específico, enviar só para ele, senão para toda a sala
    if (data.to) {
      io.to(data.to).emit('webrtc-offer', {
        offer: data.offer,
        from: socket.id,
        username: user.username
      });
    } else {
      socket.to(user.room).emit('webrtc-offer', {
        offer: data.offer,
        from: socket.id,
        username: user.username
      });
    }
  });

  socket.on('webrtc-answer', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    // Enviar resposta para o remetente da oferta
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
    
    // Se tem destinatário específico, enviar só para ele, senão para toda a sala
    if (data.to) {
      io.to(data.to).emit('webrtc-ice-candidate', {
        candidate: data.candidate,
        from: socket.id,
        username: user.username
      });
    } else {
      socket.to(user.room).emit('webrtc-ice-candidate', {
        candidate: data.candidate,
        from: socket.id,
        username: user.username
      });
    }
  });

  // Indicador de áudio (quem está falando)
  socket.on('audio-speaking', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    socket.to(user.room).emit('user-speaking', {
      username: user.username,
      socketId: socket.id,
      isSpeaking: data.isSpeaking
    });
  });

  // Usuário desconecta
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    
    if (user) {
      const { username, room } = user;
      
      // Remover da sala
      if (rooms.has(room)) {
        rooms.get(room).delete(socket.id);
      }
      
      // Remover usuário
      users.delete(socket.id);
      
      // Notificar outros usuários
      socket.to(room).emit('user-left-room', {
        username,
        message: `${username} saiu do chat`,
        timestamp: new Date().toISOString()
      });
      
      // Atualizar lista de usuários
      const roomUsers = Array.from(rooms.get(room) || [])
        .map(id => users.get(id))
        .filter(u => u !== undefined);
      
      io.to(room).emit('users-in-room', roomUsers);
      
      console.log(`${username} saiu da sala: ${room}`);
    }
  });
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    users: users.size,
    rooms: rooms.size
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

