import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import * as api from '../utils/api';
import ServerList from './server/ServerList';
import ServerSidebar from './server/ServerSidebar';
import ChannelView from './channel/ChannelView';
import UserPanel from './user/UserPanel';
import './MainApp.css';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

function MainApp() {
  const { user, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
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

  if (loading) {
    return (
      <div className="main-app-loading">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="main-app">
      <ServerList
        servers={servers}
        selectedServer={selectedServer}
        onSelectServer={handleSelectServer}
        onCreateServer={handleCreateServer}
      />
      
      {selectedServer && (
        <>
          <ServerSidebar
            server={selectedServer}
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
            onServerUpdate={loadServers}
          />
          
          {selectedChannel ? (
            <ChannelView
              socket={socket}
              server={selectedServer}
              channel={selectedChannel}
              user={user}
            />
          ) : (
            <div className="channel-placeholder">
              <h2>Selecione um canal</h2>
            </div>
          )}
        </>
      )}

      {!selectedServer && (
        <div className="no-server-selected">
          <h2>Bem-vindo ao TalkChat!</h2>
          <p>Crie ou selecione um servidor para começar</p>
        </div>
      )}

      <UserPanel user={user} onLogout={logout} />
    </div>
  );
}

export default MainApp;

