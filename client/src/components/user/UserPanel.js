import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './UserPanel.css';

function UserPanel({ user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'status-online';
      case 'idle':
        return 'status-idle';
      case 'busy':
        return 'status-dnd';
      default:
        return 'status-offline';
    }
  };

  return (
    <div className="user-panel">
      <div
        className="user-panel-info"
        onClick={() => setShowMenu(!showMenu)}
      >
        <div className="user-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <div className="user-avatar-placeholder">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <span className={`status-indicator ${getStatusColor(user.status)}`}></span>
        </div>
        <div className="user-info">
          <div className="user-username">{user.username}</div>
          <div className="user-status">{user.status || 'offline'}</div>
        </div>
        <div className="user-actions">
          <button className="user-action-btn">⚙️</button>
          <button className="user-action-btn" onClick={onLogout}>🚪</button>
        </div>
      </div>
    </div>
  );
}

export default UserPanel;

