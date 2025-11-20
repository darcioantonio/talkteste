import React from 'react';
import './MessageInput.css';

function MessageInput({ value, onChange, onSubmit, placeholder }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={onSubmit} className="message-input-form">
        <div className="message-input-wrapper">
          <input
            type="text"
            value={value}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="message-input"
            maxLength={2000}
          />
        </div>
      </form>
    </div>
  );
}

export default MessageInput;
