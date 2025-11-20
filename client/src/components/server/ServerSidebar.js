import React, { useState } from 'react';
import * as api from '../../utils/api';
import CreateChannelModal from './CreateChannelModal';
import UserPanel from '../user/UserPanel';
import './ServerSidebar.css';

function ServerSidebar({ server, selectedChannel, onSelectChannel, onServerUpdate, channelUsers = {}, user, onLogout }) {
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const textChannels = server.channels.filter(c => c.type === 'text');
  const voiceChannels = server.channels.filter(c => c.type === 'voice');

  const isOwnerOrAdmin = server.members.find(
    m => m.user._id === server.owner._id || m.role === 'admin'
  );

  const handleCreateChannel = async (name, type, maxUsers, isPrivate) => {
    try {
      await api.createChannel(server._id, {
        name,
        type,
        maxUsers: type === 'voice' ? maxUsers : undefined,
        isPrivate: type === 'voice' ? isPrivate : undefined
      });
      onServerUpdate();
      setShowCreateChannel(false);
    } catch (error) {
      alert(error.message || 'Erro ao criar canal');
    }
  };

  return (
    <div className="server-sidebar">
      <div className="server-sidebar-header">
        <h2 className="server-name">{server.name}</h2>
        {isOwnerOrAdmin && (
          <button
            className="server-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Configurações"
          >
            ⚙️
          </button>
        )}
      </div>

      <div className="channels-section">
        <div className="channels-header">
          <span className="channels-title">CANAIS DE TEXTO</span>
          {isOwnerOrAdmin && (
            <button
              className="add-channel-btn"
              onClick={() => setShowCreateChannel(true)}
              title="Criar Canal"
            >
              +
            </button>
          )}
        </div>
        <div className="channels-list">
          {textChannels.map((channel) => (
            <div
              key={channel._id}
              className={`channel-item ${selectedChannel?._id === channel._id ? 'active' : ''}`}
              onClick={() => onSelectChannel(channel)}
            >
              <span className="channel-icon">#</span>
              <span className="channel-name">{channel.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="channels-section">
        <div className="channels-header">
          <span className="channels-title">CANAIS DE VOZ</span>
          {isOwnerOrAdmin && (
            <button
              className="add-channel-btn"
              onClick={() => setShowCreateChannel(true)}
              title="Criar Canal de Voz"
            >
              +
            </button>
          )}
        </div>
        <div className="channels-list">
          {voiceChannels.map((channel) => (
            <div key={channel._id} className="channel-container">
              <div
                className={`channel-item voice ${selectedChannel?._id === channel._id ? 'active' : ''}`}
                onClick={() => onSelectChannel(channel)}
              >
                <span className="channel-icon">🔊</span>
                <span className="channel-name">{channel.name}</span>
                {channel.voiceSettings?.maxUsers > 0 && (
                  <span className="channel-slots">
                    {channel.voiceSettings.maxUsers} slots
                  </span>
                )}
                {channel.voiceSettings?.isPrivate && (
                  <span className="channel-private">🔒</span>
                )}
              </div>
              {channelUsers[channel._id] && channelUsers[channel._id].length > 0 && (
                <div className="channel-users-list">
                  {channelUsers[channel._id].map((u) => (
                    <div key={u.socketId} className="channel-user-item">
                      <div className="user-avatar-mini">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-name-mini">{u.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <UserPanel user={user} onLogout={onLogout} />

      {showCreateChannel && (
        <CreateChannelModal
          onClose={() => setShowCreateChannel(false)}
          onCreate={handleCreateChannel}
        />
      )}
    </div>
  );
}

export default ServerSidebar;
