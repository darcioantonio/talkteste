import React from 'react';
import './MessageList.css';

function MessageList({ messages, currentUser, typingUsers }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${message.username === currentUser ? 'own-message' : ''} ${message.isSystem ? 'system-message' : ''}`}
        >
          {!message.isSystem && (
            <div className="message-header">
              <span className="message-username">{message.username}</span>
              <span className="message-time">{formatTime(message.timestamp)}</span>
            </div>
          )}
          <div className="message-content">{message.message}</div>
        </div>
      ))}
      
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          <span>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'está' : 'estão'} digitando...
          </span>
          <span className="typing-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default MessageList;

