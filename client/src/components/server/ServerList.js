import React, { useState } from 'react';
import CreateServerModal from './CreateServerModal';
import './ServerList.css';

function ServerList({ servers, selectedServer, onSelectServer, onCreateServer }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateServer = async (name, description) => {
    try {
      await onCreateServer(name, description);
      setShowCreateModal(false);
    } catch (error) {
      alert(error.message || 'Erro ao criar servidor');
    }
  };

  return (
    <>
      <div className="server-list">
        <div className="server-list-header">
          <div className="server-icon home-icon" title="Home">
            💬
          </div>
        </div>
        
        <div className="server-divider"></div>

        <div className="server-items">
          {servers.map((server) => (
            <div
              key={server._id}
              className={`server-icon ${selectedServer?._id === server._id ? 'active' : ''}`}
              onClick={() => onSelectServer(server._id)}
              title={server.name}
            >
              {server.icon || server.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>

        <div className="server-divider"></div>

        <div
          className="server-icon add-server"
          onClick={() => setShowCreateModal(true)}
          title="Adicionar Servidor"
        >
          +
        </div>
      </div>

      {showCreateModal && (
        <CreateServerModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateServer}
        />
      )}
    </>
  );
}

export default ServerList;

