import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import * as api from '../utils/api';
import ServerList from './server/ServerList';
import ServerSidebar from './server/ServerSidebar';
import ChannelView from './channel/ChannelView';
import UserPanel from './user/UserPanel';
import './MainApp.css';
import MobileNavBar from './mobile/MobileNavBar';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

function MainApp() {
  const { user, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channelUsers, setChannelUsers] = useState({});
  const [mobileView, setMobileView] = useState('nav'); // 'nav' | 'chat'
  const [activeTab, setActiveTab] = useState('servers'); // 'servers' | 'messages' | 'notifications' | 'you'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Conectar Socket.io
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('Conectado ao servidor');
    });

    // Listeners para usuários nos canais
    newSocket.on('users-in-channel', ({ channelId, users }) => {
      setChannelUsers(prev => ({
        ...prev,
        [channelId]: users
      }));
    });

    newSocket.on('user-joined-channel', ({ channelId, username, socketId }) => {
      setChannelUsers(prev => {
        const currentUsers = prev[channelId] || [];
        if (currentUsers.find(u => u.socketId === socketId)) return prev;
        return {
          ...prev,
          [channelId]: [...currentUsers, { socketId, username }]
        };
      });
    });

    newSocket.on('user-left-channel', ({ channelId, socketId }) => {
      setChannelUsers(prev => {
        const currentUsers = prev[channelId] || [];
        return {
          ...prev,
          [channelId]: currentUsers.filter(u => u.socketId !== socketId)
        };
      });
    });

    setSocket(newSocket);

    // Carregar servidores
    loadServers();

    return () => {
      newSocket.close();
    };
  }, []);

  const loadServers = async () => {
    try {
      const { servers } = await api.getMyServers();
      setServers(servers);
      if (servers.length > 0 && !selectedServer) {
        const server = await api.getServer(servers[0]._id);
        setSelectedServer(server.server);
        if (server.server.channels.length > 0) {
          setSelectedChannel(server.server.channels[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar servidores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectServer = async (serverId) => {
    try {
      const { server } = await api.getServer(serverId);
      setSelectedServer(server);
      if (server.channels.length > 0) {
        setSelectedChannel(server.channels[0]);
      } else {
        setSelectedChannel(null);
      }
      // Ensure we are on the servers tab
      setActiveTab('servers');
    } catch (error) {
      console.error('Erro ao carregar servidor:', error);
    }
  };

  const handleCreateServer = async (name, description) => {
    try {
      const { server } = await api.createServer(name, description);
      setServers([...servers, server]);
      setSelectedServer(server);
      if (server.channels.length > 0) {
        setSelectedChannel(server.channels[0]);
      }
    } catch (error) {
      console.error('Erro ao criar servidor:', error);
      throw error;
    }
  };

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
    setMobileView('chat');
  };

  const handleMobileBack = () => {
    setMobileView('nav');
  };

  const renderMobileContent = () => {
    switch (activeTab) {
      case 'servers':
        return (
          <div className="sidebar-wrapper">
            <ServerList
              servers={servers}
              selectedServer={selectedServer}
              onSelectServer={(id) => {
                handleSelectServer(id);
                setMobileView('nav');
              }}
              onCreateServer={handleCreateServer}
            />

            {selectedServer ? (
              <ServerSidebar
                server={selectedServer}
                selectedChannel={selectedChannel}
                onSelectChannel={handleChannelSelect}
                onServerUpdate={loadServers}
                channelUsers={channelUsers}
                user={user}
                onLogout={logout}
              />
            ) : (
              <div className="no-server-selected">
                <h2>Bem-vindo ao TalkChat!</h2>
                <p>Selecione um servidor</p>
              </div>
            )}
          </div>
        );
      case 'you':
        return (
          <div className="mobile-tab-content">
            <div className="mobile-profile-view">
              <div className="mobile-profile-header">
                <div className="mobile-profile-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <h2>{user.username}</h2>
                <span className="status-badge online">Online</span>
              </div>
              <div className="mobile-profile-actions">
                <button className="profile-action-btn" onClick={logout}>
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="mobile-tab-content">
            <div className="placeholder-tab">
              <h3>Em breve</h3>
              <p>A aba {activeTab} está em desenvolvimento.</p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="main-app-loading">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className={`main-app ${mobileView === 'chat' ? 'mobile-view-chat' : 'mobile-view-nav'}`}>
      {/* Desktop View / Mobile Server Tab */}
      <div className="desktop-layout">
        <div className="sidebar-wrapper">
          <ServerList
            servers={servers}
            selectedServer={selectedServer}
            onSelectServer={(id) => {
              handleSelectServer(id);
              setMobileView('nav');
            }}
            onCreateServer={handleCreateServer}
          />

          {selectedServer && (
            <ServerSidebar
              server={selectedServer}
              selectedChannel={selectedChannel}
              onSelectChannel={handleChannelSelect}
              onServerUpdate={loadServers}
              channelUsers={channelUsers}
              user={user}
              onLogout={logout}
            />
          )}
        </div>
      </div>

      {/* Mobile Content Area (Replaces sidebar-wrapper on mobile) */}
      <div className="mobile-layout-content">
        {renderMobileContent()}
      </div>

      {/* Chat View (Shared) */}
      {selectedServer && (
        <div className="channel-view-wrapper">
          {selectedChannel ? (
            <ChannelView
              socket={socket}
              server={selectedServer}
              channel={selectedChannel}
              user={user}
              onMobileBack={handleMobileBack}
            />
          ) : (
            <div className="channel-placeholder">
              <h2>Selecione um canal</h2>
            </div>
          )}
        </div>
      )}

      {!selectedServer && !activeTab && (
        <div className="no-server-selected desktop-only">
          <h2>Bem-vindo ao TalkChat!</h2>
          <p>Crie ou selecione um servidor para começar</p>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      {mobileView === 'nav' && (
        <MobileNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          user={user}
        />
      )}
    </div>
  );
}

export default MainApp;
