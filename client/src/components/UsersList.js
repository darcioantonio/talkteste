import React from 'react';
import './UsersList.css';

function UsersList({ users = [], currentUser, speakingUsers = new Set() }) {
  if (!users || users.length === 0) {
    return (
      <div className="users-list">
        <div className="users-header">
          <h3>👥 Membros</h3>
        </div>
        <div className="users-content">
          <div className="users-empty">Nenhum membro</div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-list">
      <div className="users-header">
        <h3>👥 Membros — {users.length}</h3>
      </div>
      <div className="users-content">
        {users.map((user, index) => {
          const userId = user._id || user.id || user.socketId || index;
          const username = user.username || user.name || 'Usuário';
          const isCurrentUser = currentUser && (
            userId === currentUser.id || 
            userId === currentUser._id ||
            username === currentUser.username
          );
          const isSpeaking = speakingUsers.has(userId) || speakingUsers.has(user.socketId);

          return (
            <div
              key={userId}
              className={`user-item ${isCurrentUser ? 'current-user' : ''} ${isSpeaking ? 'speaking' : ''}`}
            >
              <div className="user-avatar-small">
                {user.avatar ? (
                  <img src={user.avatar} alt={username} />
                ) : (
                  <div className="user-avatar-placeholder-small">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={`status-indicator status-${user.status || 'offline'}`}></span>
              </div>
              <span className="user-name">{username}</span>
              {isSpeaking && <span className="speaking-badge">🎤</span>}
              {isCurrentUser && (
                <span className="you-badge">(você)</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UsersList;
