import React, { useEffect, useRef } from 'react';

function AudioPlayer({ peer, isSpeaking, audioEnabled }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (peer && peer.stream && audioRef.current) {
      audioRef.current.srcObject = peer.stream;
      audioRef.current.volume = audioEnabled ? 1 : 0;
    }
  }, [peer, audioEnabled]);

  if (!peer || !peer.stream) return null;

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      style={{ display: 'none' }}
    />
  );
}

export default AudioPlayer;

