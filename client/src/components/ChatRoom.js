import React, { useState, useEffect, useRef } from 'react';
import './ChatRoom.css';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UsersList from './UsersList';
import AudioControls from './AudioControls';
import AudioPlayer from './AudioPlayer';
import { useAudio } from '../hooks/useAudio';

function ChatRoom({ socket, user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Hook de áudio
  const {
    isMicOn,
    isSpeaking,
    audioEnabled,
    peers,
    speakingUsers,
    toggleMicrophone,
    setAudioEnabled
  } = useAudio(socket, user.room);

  useEffect(() => {
    if (!socket) return;

    // Receber mensagens
    socket.on('receive-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Usuário entrou
    socket.on('user-joined-room', (data) => {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        username: 'Sistema',
        message: data.message,
        timestamp: data.timestamp,
        isSystem: true
      }]);
    });

    // Usuário saiu
    socket.on('user-left-room', (data) => {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        username: 'Sistema',
        message: data.message,
        timestamp: data.timestamp,
        isSystem: true
      }]);
    });

    // Lista de usuários na sala
    socket.on('users-in-room', (roomUsers) => {
      setUsers(roomUsers);
    });

    // Indicador de digitação
    socket.on('user-typing', (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username];
          }
          return prev;
        });
      } else {
        setTypingUsers((prev) => prev.filter(u => u !== data.username));
      }
    });

    // Cleanup
    return () => {
      socket.off('receive-message');
      socket.off('user-joined-room');
      socket.off('user-left-room');
      socket.off('users-in-room');
      socket.off('user-typing');
    };
  }, [socket]);

  // Scroll automático para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (message) => {
    if (socket && message.trim()) {
      socket.emit('send-message', { message: message.trim() });
    }
  };

  const handleTyping = (isTyping) => {
    if (socket) {
      socket.emit('typing', { isTyping });
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <div className="header-info">
          <h2>💬 {user.room}</h2>
          <span className="user-count">{users.length} online</span>
        </div>
        <div className="header-user">
          <span className="username-badge">{user.username}</span>
          <button onClick={onLogout} className="logout-button">
            Sair
          </button>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-main">
          <MessageList 
            messages={messages} 
            currentUser={user.username}
            typingUsers={typingUsers}
          />
          <div ref={messagesEndRef} />
          <AudioControls
            isMicOn={isMicOn}
            isSpeaking={isSpeaking}
            onToggleMic={toggleMicrophone}
            audioEnabled={audioEnabled}
            onToggleAudio={() => setAudioEnabled(!audioEnabled)}
          />
          <MessageInput 
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
          />
        </div>
        <UsersList 
          users={users} 
          currentUser={user.username}
          speakingUsers={speakingUsers}
        />
      </div>
      
      {/* Audio players para cada peer */}
      {Array.from(peers.entries()).map(([socketId, peer]) => (
        <AudioPlayer
          key={socketId}
          peer={peer}
          isSpeaking={speakingUsers.has(socketId)}
          audioEnabled={audioEnabled}
        />
      ))}
    </div>
  );
}

export default ChatRoom;

