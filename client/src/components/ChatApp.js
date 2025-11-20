import React, { useState, useEffect, useRef } from 'react';
import ChannelList from './ChannelList';
import ChatArea from './ChatArea';
import UserPanel from './UserPanel';
import AudioControls from './AudioControls';
import PushToTalkSettings from './PushToTalkSettings';
import { useAudio } from '../hooks/useAudio';
import './ChatApp.css';

function ChatApp({ socket, username }) {
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState('geral');
  const [messages, setMessages] = useState([]);
  const [usersInChannel, setUsersInChannel] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showPushToTalkSettings, setShowPushToTalkSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    isMicOn,
    isSpeaking,
    audioEnabled,
    peers,
    speakingUsers,
    toggleMicrophone,
    setAudioEnabled,
    pushToTalkEnabled,
    pushToTalkKey,
    setPushToTalk
  } = useAudio(socket, currentChannel);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  useEffect(() => {
    if (!socket) return;

    // Carregar canais
    fetch(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:4000'}/api/channels`)
      .then(res => res.json())
      .then(data => {
        setChannels(data.channels);
      });

    // Receber mensagens
    socket.on('receive-message', (message) => {
      setMessages((prev) => {
        // Evitar duplicatas
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    // Mensagens do canal
    socket.on('channel-messages', (data) => {
      if (data.channelId === currentChannel) {
        setMessages(data.messages);
      }
    });

    // Usuários no canal
    socket.on('users-in-channel', (data) => {
      if (data.channelId === currentChannel) {
        setUsersInChannel(data.users);
      }
    });

    // Usuário entrou no canal
    socket.on('user-joined-channel', (data) => {
      if (data.channelId === currentChannel) {
        setUsersInChannel((prev) => {
          if (!prev.find(u => u.socketId === data.socketId)) {
            return [...prev, { socketId: data.socketId, username: data.username }];
          }
          return prev;
        });
      }
    });

    // Usuário saiu do canal
    socket.on('user-left-channel', (data) => {
      if (data.channelId === currentChannel) {
        setUsersInChannel((prev) => prev.filter(u => u.socketId !== data.socketId));
      }
    });

    // Indicador de digitação
    socket.on('user-typing', (data) => {
      if (data.channelId === currentChannel) {
        if (data.isTyping) {
          setTypingUsers((prev) => {
            if (!prev.includes(data.username)) {
              return [...prev, data.username];
            }
            return prev;
          });
        } else {
          setTypingUsers((prev) => prev.filter(u => u !== data.username));
        }
      }
    });

    return () => {
      socket.off('receive-message');
      socket.off('channel-messages');
      socket.off('users-in-channel');
      socket.off('user-joined-channel');
      socket.off('user-left-channel');
      socket.off('user-typing');
    };
  }, [socket, currentChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChannelChange = (channelId) => {
    setCurrentChannel(channelId);
    setMessages([]);
    setUsersInChannel([]);
    setTypingUsers([]);
    
    if (socket) {
      socket.emit('switch-channel', { channelId });
    }
  };

  const handleSendMessage = (content) => {
    if (socket && content.trim()) {
      socket.emit('send-message', {
        channelId: currentChannel,
        content: content.trim()
      });
    }
  };

  const handleTyping = (isTyping) => {
    if (socket) {
      socket.emit('typing', {
        channelId: currentChannel,
        isTyping
      });
    }
  };

  const currentChannelData = channels.find(c => c.id === currentChannel);

  return (
    <div className="chat-app">
      <ChannelList
        channels={channels}
        currentChannel={currentChannel}
        onChannelChange={handleChannelChange}
      />

      <div className="chat-main">
        <ChatArea
          channel={currentChannelData}
          messages={messages.filter(m => m.channelId === currentChannel)}
          typingUsers={typingUsers}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          currentChannel={currentChannel}
          messagesEndRef={messagesEndRef}
        />

        <div className="chat-sidebar">
          <div className="users-section">
            <h3 className="users-title">No Canal ({usersInChannel.length})</h3>
            <div className="users-list">
              {usersInChannel.map((user) => (
                <div key={user.socketId} className="user-item">
                  <span className="status-indicator status-online"></span>
                  <span className="user-name">{user.username}</span>
                  {speakingUsers.has(user.socketId) && (
                    <span className="speaking-badge">🎤</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <AudioControls
            isMicOn={isMicOn}
            isSpeaking={isSpeaking}
            onToggleMic={toggleMicrophone}
            audioEnabled={audioEnabled}
            onToggleAudio={() => setAudioEnabled(!audioEnabled)}
            onPushToTalkSettings={() => setShowPushToTalkSettings(true)}
            pushToTalkEnabled={pushToTalkEnabled}
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
        </div>
      </div>

      <UserPanel username={username} />

      {showPushToTalkSettings && (
        <PushToTalkSettings
          onClose={() => setShowPushToTalkSettings(false)}
          enabled={pushToTalkEnabled}
          key={pushToTalkKey}
          onSave={(enabled, key) => {
            setPushToTalk(enabled, key);
            setShowPushToTalkSettings(false);
          }}
        />
      )}

      {/* Audio players para cada peer */}
      {Array.from(peers.entries()).map(([socketId, peer]) => (
        <audio
          key={socketId}
          autoPlay
          playsInline
          style={{ display: 'none' }}
          ref={(audio) => {
            if (audio && peer.stream) {
              audio.srcObject = peer.stream;
              audio.volume = audioEnabled ? 1 : 0;
            }
          }}
        />
      ))}
    </div>
  );
}

export default ChatApp;

