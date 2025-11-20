import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import ChatRoom from './components/ChatRoom';
import LoginForm from './components/LoginForm';

// URL do servidor - em produção usa a variável de ambiente ou o mesmo domínio
const getServerUrl = () => {
  // Se tiver variável de ambiente, usa ela
  if (process.env.REACT_APP_SERVER_URL) {
    return process.env.REACT_APP_SERVER_URL;
  }
  
  // Em produção, usa o mesmo domínio (cliente e servidor no mesmo lugar)
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  
  // Em desenvolvimento, usa localhost
  return 'http://localhost:4000';
};

const SERVER_URL = getServerUrl();

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Criar conexão Socket.io
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Conectado ao servidor');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado do servidor');
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      newSocket.close();
    };
  }, []);

  const handleLogin = (username, room) => {
    if (socket && username.trim() && room.trim()) {
      setUser({ username, room });
      socket.emit('user-joined', { username, room });
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    setUser(null);
    setIsConnected(false);
  };

  if (!user) {
    return (
      <div className="app">
        <LoginForm onLogin={handleLogin} isConnected={isConnected} />
      </div>
    );
  }

  return (
    <div className="app">
      <ChatRoom socket={socket} user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;

