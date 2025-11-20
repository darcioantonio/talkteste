import React, { useState } from 'react';
import './CreateChannelModal.css';

function CreateChannelModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [maxUsers, setMaxUsers] = useState(0);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onCreate(
      name.trim(),
      type,
      type === 'voice' ? (maxUsers > 0 ? maxUsers : 0) : undefined,
      type === 'voice' ? isPrivate : undefined
    );
  };

  return (
    <div className="discord-modal-overlay" onClick={onClose}>
      <div className="discord-modal" onClick={(e) => e.stopPropagation()}>
        <div className="discord-modal-header">
          <h2 className="discord-modal-title">Criar Canal</h2>
        </div>
        <form onSubmit={handleSubmit} className="discord-modal-body">
          <div className="form-group">
            <label htmlFor="channel-name">NOME DO CANAL</label>
            <input
              type="text"
              id="channel-name"
              className="discord-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="novo-canal"
              required
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="channel-type">TIPO</label>
            <select
              id="channel-type"
              className="discord-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="text">Texto</option>
              <option value="voice">Voz</option>
            </select>
          </div>

          {type === 'voice' && (
            <>
              <div className="form-group">
                <label htmlFor="max-users">LIMITE DE USUÁRIOS (0 = ilimitado)</label>
                <input
                  type="number"
                  id="max-users"
                  className="discord-input"
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(parseInt(e.target.value) || 0)}
                  min="0"
                  max="99"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                  <span>Canal Privado</span>
                </label>
              </div>
            </>
          )}

          <div className="discord-modal-footer">
            <button
              type="button"
              className="discord-button discord-button-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="discord-button discord-button-primary"
              disabled={!name.trim()}
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateChannelModal;

