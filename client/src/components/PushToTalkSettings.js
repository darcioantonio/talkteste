import React, { useState, useEffect } from 'react';
import './PushToTalkSettings.css';

const KEY_NAMES = {
  'Space': 'Espaço',
  'KeyQ': 'Q',
  'KeyE': 'E',
  'KeyF': 'F',
  'KeyV': 'V',
  'KeyB': 'B',
  'KeyG': 'G',
  'KeyT': 'T',
  'KeyR': 'R',
  'KeyC': 'C',
  'KeyX': 'X',
  'KeyZ': 'Z',
  'Digit1': '1',
  'Digit2': '2',
  'Digit3': '3',
  'Digit4': '4',
  'Digit5': '5',
};

function PushToTalkSettings({ onClose, enabled, key: currentKey, onSave }) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [selectedKey, setSelectedKey] = useState(currentKey || 'Space');
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (listening) {
      const handleKeyDown = (e) => {
        e.preventDefault();
        const keyCode = e.code || e.keyCode;
        setSelectedKey(keyCode);
        setListening(false);
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [listening]);

  const handleSave = () => {
    onSave(isEnabled, isEnabled ? selectedKey : null);
  };

  return (
    <div className="discord-modal-overlay" onClick={onClose}>
      <div className="discord-modal" onClick={(e) => e.stopPropagation()}>
        <div className="discord-modal-header">
          <h2 className="discord-modal-title">Configurar Push-to-Talk</h2>
        </div>
        <div className="discord-modal-body">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
              />
              <span>Ativar Push-to-Talk</span>
            </label>
            <p className="form-help">
              Com Push-to-Talk ativado, você precisa segurar uma tecla para falar.
            </p>
          </div>

          {isEnabled && (
            <div className="form-group">
              <label>Tecla para Push-to-Talk</label>
              <div className="key-selector">
                <button
                  type="button"
                  className="key-button"
                  onClick={() => setListening(true)}
                  onBlur={() => setListening(false)}
                >
                  {listening ? 'Pressione uma tecla...' : (KEY_NAMES[selectedKey] || selectedKey)}
                </button>
              </div>
              <p className="form-help">
                Clique no botão acima e pressione a tecla que deseja usar.
              </p>
            </div>
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
              type="button"
              className="discord-button discord-button-primary"
              onClick={handleSave}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PushToTalkSettings;

