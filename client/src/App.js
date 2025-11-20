import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './styles/discord.css';
import './App.css';
import ChatApp from './components/ChatApp';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
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

    return () => {
      newSocket.close();
    };
  }, []);

  const handleLogin = (name) => {
    if (socket && name.trim()) {
      setUsername(name.trim());
      socket.emit('user-join', { username: name.trim() });
    }
  };

  if (!username) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <h1 className="login-title">💬 TalkChat</h1>
          <p className="login-subtitle">Digite seu nome para começar</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.target.querySelector('input');
              if (input.value.trim()) {
                handleLogin(input.value);
              }
            }}
            className="login-form"
          >
            <input
              type="text"
              placeholder="Seu nome"
              className="discord-input"
              maxLength={20}
              autoFocus
              disabled={!isConnected}
            />
            <button
              type="submit"
              className="discord-button discord-button-primary"
              disabled={!isConnected}
            >
              Entrar
            </button>
          </form>
          {!isConnected && (
            <p className="login-status">Conectando ao servidor...</p>
          )}
        </div>
      </div>
    );
  }

  return <ChatApp socket={socket} username={username} />;
}

export default App;
