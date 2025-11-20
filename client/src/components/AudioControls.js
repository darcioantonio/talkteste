import React from 'react';
import './AudioControls.css';

function AudioControls({
  isMicOn,
  isSpeaking,
  onToggleMic,
  audioEnabled,
  onToggleAudio,
  onPushToTalkSettings,
  pushToTalkEnabled,
  isMuted,
  onToggleMute
}) {
  return (
    <div className="audio-controls">
      <button
        className={`mic-button ${isMicOn ? 'on' : 'off'} ${isSpeaking ? 'speaking' : ''} ${isMuted ? 'muted' : ''}`}
        onClick={onToggleMic}
        title={isMicOn ? 'Desligar microfone' : 'Ligar microfone'}
      >
        {isMicOn ? (
          isMuted ? (
            <span className="mic-icon">🔇</span>
          ) : (
            <span className="mic-icon">🎤</span>
          )
        ) : (
          <span className="mic-icon muted">🎤</span>
        )}
        {isSpeaking && !isMuted && <span className="speaking-indicator"></span>}
      </button>
      
      <button
        className={`audio-button ${audioEnabled ? 'on' : 'off'}`}
        onClick={onToggleAudio}
        title={audioEnabled ? 'Desligar áudio' : 'Ligar áudio'}
      >
        {audioEnabled ? '🔊' : '🔇'}
      </button>

      {isMicOn && (
        <>
          <button
            className={`mute-button ${isMuted ? 'active' : ''}`}
            onClick={onToggleMute}
            title={isMuted ? 'Desmutar' : 'Mutar'}
          >
            {isMuted ? '🔇' : '🎤'}
          </button>

          <button
            className={`push-to-talk-button ${pushToTalkEnabled ? 'active' : ''}`}
            onClick={onPushToTalkSettings}
            title="Configurar Push-to-Talk"
          >
            ⌨️
          </button>
        </>
      )}
    </div>
  );
}

export default AudioControls;
