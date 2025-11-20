import React from 'react';
import './UserPanel.css';

function UserPanel({ username }) {
  return (
    <div className="user-panel">
      <div className="user-panel-info">
        <div className="user-avatar">
          <div className="user-avatar-placeholder">
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="status-indicator status-online"></span>
        </div>
        <div className="user-info">
          <div className="user-username">{username}</div>
          <div className="user-status">online</div>
        </div>
      </div>
    </div>
  );
}

export default UserPanel;

