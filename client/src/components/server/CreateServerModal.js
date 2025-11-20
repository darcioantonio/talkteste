import React, { useState } from 'react';
import './CreateServerModal.css';

function CreateServerModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onCreate(name.trim(), description.trim());
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className="discord-modal-overlay" onClick={onClose}>
      <div className="discord-modal" onClick={(e) => e.stopPropagation()}>
        <div className="discord-modal-header">
          <h2 className="discord-modal-title">Criar Servidor</h2>
        </div>
        <form onSubmit={handleSubmit} className="discord-modal-body">
          <div className="form-group">
            <label htmlFor="server-name">NOME DO SERVIDOR</label>
            <input
              type="text"
              id="server-name"
              className="discord-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meu Servidor Incrível"
              required
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="server-description">DESCRIÇÃO (opcional)</label>
            <textarea
              id="server-description"
              className="discord-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva seu servidor..."
              rows="3"
              maxLength={500}
            />
          </div>

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
              disabled={loading || !name.trim()}
            >
              {loading ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateServerModal;

