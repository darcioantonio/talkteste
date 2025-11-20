import React from 'react';
import './UsersList.css';

function UsersList({ users, currentUser, speakingUsers = new Set() }) {
  return (
    <div className="users-list">
      <div className="users-header">
        <h3>👥 Online ({users.length})</h3>
      </div>
      <div className="users-content">
        {users.map((user, index) => {
          const isSpeaking = speakingUsers.has(user.socketId);
          return (
            <div
              key={user.socketId || index}
              className={`user-item ${user.username === currentUser ? 'current-user' : ''} ${isSpeaking ? 'speaking' : ''}`}
            >
              <span className="user-dot"></span>
              <span className="user-name">{user.username}</span>
              {isSpeaking && <span className="speaking-badge">🎤</span>}
              {user.username === currentUser && (
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

