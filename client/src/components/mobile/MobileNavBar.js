import React from 'react';
import './MobileNavBar.css';

function MobileNavBar({ activeTab, onTabChange, user, notificationCount = 0 }) {
    return (
        <div className="mobile-nav-bar">
            <button
                className={`mobile-nav-item ${activeTab === 'servers' ? 'active' : ''}`}
                onClick={() => onTabChange('servers')}
            >
                <div className="mobile-nav-icon">
                    👥
                </div>
                <span>Servers</span>
            </button>

            <button
                className={`mobile-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => onTabChange('messages')}
            >
                <div className="mobile-nav-icon">
                    💬
                </div>
                <span>Messages</span>
            </button>

            <button
                className={`mobile-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => onTabChange('notifications')}
            >
                <div className="mobile-nav-icon">
                    🔔
                    {notificationCount > 0 && (
                        <span className="nav-badge">{notificationCount}</span>
                    )}
                </div>
                <span>Notifications</span>
            </button>

            <button
                className={`mobile-nav-item ${activeTab === 'you' ? 'active' : ''}`}
                onClick={() => onTabChange('you')}
            >
                <div className="user-avatar-nav">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.username} />
                    ) : (
                        user?.username?.charAt(0).toUpperCase()
                    )}
                </div>
                <span>You</span>
            </button>
        </div>
    );
}

export default MobileNavBar;
