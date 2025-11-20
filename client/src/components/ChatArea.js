import React, { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatArea.css';

function ChatArea({ channel, messages, typingUsers, onSendMessage, onTyping, currentChannel, messagesEndRef }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim() && !typingUsers.length) {
      onTyping(true);
    }

    const timeout = setTimeout(() => {
      onTyping(false);
    }, 1000);

    return () => clearTimeout(timeout);
  };

  const canSendToChannel = channel?.isGlobal || true; // Geral sempre pode, outros precisam estar no canal

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="chat-header-info">
          <span className="chat-header-icon">
            {channel?.isGlobal ? '🌐' : '#'}
          </span>
          <h2 className="chat-header-name">{channel?.name || 'Carregando...'}</h2>
        </div>
        {channel?.isGlobal && (
          <div className="chat-header-badge">Global</div>
        )}
      </div>

      <MessageList
        messages={messages}
        typingUsers={typingUsers}
        messagesEndRef={messagesEndRef}
      />

      {canSendToChannel ? (
        <MessageInput
          value={inputValue}
          onChange={handleChange}
          onSubmit={handleSubmit}
          placeholder={channel?.isGlobal ? 'Conversar no canal geral (global)' : `Conversar em #${channel?.name}`}
        />
      ) : (
        <div className="message-input-disabled">
          Você precisa estar no canal para enviar mensagens
        </div>
      )}
    </div>
  );
}

export default ChatArea;

