import React from 'react';
import { useAudio } from '../../hooks/useAudio';
import AudioControls from '../AudioControls';
import UsersList from '../UsersList';
import './VoiceChannel.css';

function VoiceChannel({ socket, server, channel, user }) {
  const {
    isMicOn,
    isSpeaking,
    audioEnabled,
    peers,
    speakingUsers,
    toggleMicrophone,
    setAudioEnabled
  } = useAudio(socket, `${server._id}-${channel._id}`);

  const maxUsers = channel.voiceSettings?.maxUsers || 0;
  const currentUsers = peers.size + (isMicOn ? 1 : 0);
  const isFull = maxUsers > 0 && currentUsers >= maxUsers;

  return (
    <div className="voice-channel">
      <div className="voice-channel-header">
        <div className="voice-channel-info">
          <span className="voice-channel-icon">🔊</span>
          <h2 className="voice-channel-name">{channel.name}</h2>
          {maxUsers > 0 && (
            <span className="voice-channel-slots">
              ({currentUsers}/{maxUsers})
            </span>
          )}
          {channel.voiceSettings?.isPrivate && (
            <span className="voice-channel-private">🔒 Privado</span>
          )}
        </div>
      </div>

      <div className="voice-channel-content">
        <div className="voice-channel-main">
          <div className="voice-channel-placeholder">
            <div className="voice-channel-icon-large">🔊</div>
            <h3>{channel.name}</h3>
            <p>
              {isFull
                ? 'Canal cheio'
                : maxUsers > 0
                ? `${maxUsers - currentUsers} slots disponíveis`
                : 'Canal de voz ilimitado'}
            </p>
          </div>

          <div className="voice-channel-controls">
            <AudioControls
              isMicOn={isMicOn}
              isSpeaking={isSpeaking}
              onToggleMic={toggleMicrophone}
              audioEnabled={audioEnabled}
              onToggleAudio={() => setAudioEnabled(!audioEnabled)}
            />
          </div>
        </div>

        <UsersList
          users={server.members.map(m => ({
            ...m.user,
            socketId: m.user._id
          }))}
          currentUser={user}
          speakingUsers={speakingUsers}
        />
      </div>
    </div>
  );
}

export default VoiceChannel;

