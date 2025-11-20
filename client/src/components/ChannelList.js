import React from 'react';
import './ChannelList.css';

function ChannelList({ channels, currentChannel, onChannelChange }) {
  return (
    <div className="channel-list">
      <div className="channel-list-header">
        <h2>💬 TalkChat</h2>
      </div>
      
      <div className="channels-section">
        <div className="channels-title">CANAIS</div>
        <div className="channels">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`channel-item ${currentChannel === channel.id ? 'active' : ''} ${channel.isGlobal ? 'global' : ''}`}
              onClick={() => onChannelChange(channel.id)}
            >
              <span className="channel-icon">
                {channel.isGlobal ? '🌐' : '#'}
              </span>
              <span className="channel-name">{channel.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChannelList;

