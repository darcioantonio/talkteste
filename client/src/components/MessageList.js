import React from 'react';
import './MessageList.css';

function MessageList({ messages, typingUsers, messagesEndRef }) {
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
        <div key={message.id} className="message-wrapper">
          <div className="message-avatar">
            <div className="message-avatar-placeholder">
              {message.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="message-content-wrapper">
            <div className="message-header">
              <span className="message-author">{message.username}</span>
              <span className="message-timestamp">{formatTime(message.timestamp)}</span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
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
      
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
