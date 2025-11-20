import React from 'react';
import './MessageList.css';

function MessageList({ messages, typingUsers, currentUser }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  let lastDate = null;

  return (
    <div className="message-list">
      {messages.map((message, index) => {
        const messageDate = new Date(message.createdAt).toDateString();
        const showDate = lastDate !== messageDate;
        if (showDate) lastDate = messageDate;

        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showAuthor = !prevMessage || 
          prevMessage.author._id !== message.author._id ||
          new Date(message.createdAt) - new Date(prevMessage.createdAt) > 600000; // 10 minutos

        return (
          <React.Fragment key={message._id || index}>
            {showDate && (
              <div className="message-date-divider">
                <span>{formatDate(message.createdAt)}</span>
              </div>
            )}
            <div className={`message-wrapper ${showAuthor ? 'show-author' : ''}`}>
              {showAuthor && (
                <div className="message-avatar">
                  {message.author.avatar ? (
                    <img src={message.author.avatar} alt={message.author.username} />
                  ) : (
                    <div className="message-avatar-placeholder">
                      {message.author.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}
              <div className="message-content-wrapper">
                {showAuthor && (
                  <div className="message-header">
                    <span className="message-author">{message.author.username}</span>
                    <span className="message-timestamp">{formatTime(message.createdAt)}</span>
                  </div>
                )}
                <div className="message-content">{message.content}</div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      
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

