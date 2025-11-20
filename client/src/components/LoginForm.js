import React, { useState } from 'react';
import './LoginForm.css';

function LoginForm({ onLogin, isConnected }) {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('geral');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && room.trim()) {
      onLogin(username.trim(), room.trim());
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">💬 Talk Chat</h1>
        <p className="login-subtitle">Conversa em tempo real</p>
        
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Seu nome:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome"
              required
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label htmlFor="room">Sala:</label>
            <input
              type="text"
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Nome da sala"
              required
              maxLength={20}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={!isConnected}
          >
            Entrar no Chat
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;

