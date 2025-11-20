import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import VoiceChannel from './VoiceChannel';
import './ChannelView.css';

function ChannelView({ socket, server, channel, user }) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !channel) return;

    const roomId = `${server._id}-${channel._id}`;

    // Entrar na sala do canal
    socket.emit('join-channel', {
      serverId: server._id,
      channelId: channel._id,
      userId: user.id
    });

    // Receber mensagens
    socket.on('channel-message', (message) => {
      if (message.channel === channel._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Indicador de digitação
    socket.on('user-typing', (data) => {
      if (data.channelId === channel._id) {
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
      socket.off('channel-message');
      socket.off('user-typing');
      socket.emit('leave-channel', { channelId: channel._id });
    };
  }, [socket, channel, server, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content) => {
    if (socket && content.trim()) {
      socket.emit('send-channel-message', {
        serverId: server._id,
        channelId: channel._id,
        content: content.trim()
      });
    }
  };

  const handleTyping = (isTyping) => {
    if (socket) {
      socket.emit('typing', {
        channelId: channel._id,
        isTyping
      });
    }
  };

  if (channel.type === 'voice') {
    return (
      <VoiceChannel
        socket={socket}
        server={server}
        channel={channel}
        user={user}
      />
    );
  }

  return (
    <div className="channel-view">
      <div className="channel-header">
        <div className="channel-header-info">
          <span className="channel-header-icon">#</span>
          <h2 className="channel-header-name">{channel.name}</h2>
        </div>
      </div>

      <MessageList
        messages={messages}
        typingUsers={typingUsers}
        currentUser={user}
      />
      <div ref={messagesEndRef} />
      
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        channelName={channel.name}
      />
    </div>
  );
}

export default ChannelView;

