import React from 'react';
import './AudioControls.css';

function AudioControls({ isMicOn, isSpeaking, onToggleMic, audioEnabled, onToggleAudio }) {
  return (
    <div className="audio-controls">
      <button
        className={`mic-button ${isMicOn ? 'on' : 'off'} ${isSpeaking ? 'speaking' : ''}`}
        onClick={onToggleMic}
        title={isMicOn ? 'Desligar microfone' : 'Ligar microfone'}
      >
        {isMicOn ? (
          <span className="mic-icon">🎤</span>
        ) : (
          <span className="mic-icon muted">🎤</span>
        )}
        {isSpeaking && <span className="speaking-indicator"></span>}
      </button>
      
      <button
        className={`audio-button ${audioEnabled ? 'on' : 'off'}`}
        onClick={onToggleAudio}
        title={audioEnabled ? 'Desligar áudio' : 'Ligar áudio'}
      >
        {audioEnabled ? '🔊' : '🔇'}
      </button>
    </div>
  );
}

export default AudioControls;

