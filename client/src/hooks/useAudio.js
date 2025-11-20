import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudio(socket, currentChannel) {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [pushToTalkEnabled, setPushToTalkEnabled] = useState(false);
  const [pushToTalkKey, setPushToTalkKey] = useState(null);
  const [peers, setPeers] = useState(new Map());
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const speakingCheckIntervalRef = useRef(null);
  const pushToTalkActiveRef = useRef(false);

  const createOffer = useCallback(async (socketId, peerConnection) => {
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      if (socket) {
        socket.emit('webrtc-offer', {
          offer: offer,
          to: socketId
        });
      }
    } catch (error) {
      console.error('Erro ao criar oferta:', error);
    }
  }, [socket]);

  const createPeerConnection = useCallback((socketId, username) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setPeers(prev => {
        const newMap = new Map(prev);
        newMap.set(socketId, { stream: remoteStream, username });
        return newMap;
      });
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-ice-candidate', {
          candidate: event.candidate,
          to: socketId
        });
      }
    };

    peerConnectionsRef.current.set(socketId, peerConnection);

    if (localStreamRef.current && isMicOn) {
      createOffer(socketId, peerConnection);
    }

    return peerConnection;
  }, [socket, isMicOn, createOffer]);

  const handleOffer = useCallback(async ({ offer, from, username }) => {
    try {
      const peerConnection = createPeerConnection(from, username);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      if (socket) {
        socket.emit('webrtc-answer', {
          answer: answer,
          to: from
        });
      }
    } catch (error) {
      console.error('Erro ao processar oferta:', error);
    }
  }, [socket, createPeerConnection]);

  const handleAnswer = useCallback(async ({ answer, from }) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(from);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
    }
  }, []);

  const handleIceCandidate = useCallback(async ({ candidate, from }) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(from);
      if (peerConnection && candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Erro ao adicionar ICE candidate:', error);
    }
  }, []);

  const handleUserSpeaking = useCallback(({ socketId, isSpeaking: speaking }) => {
    setSpeakingUsers(prev => {
      const newSet = new Set(prev);
      if (speaking) {
        newSet.add(socketId);
      } else {
        newSet.delete(socketId);
      }
      return newSet;
    });
  }, []);

  const handleUsersInChannel = useCallback(({ users }) => {
    if (!socket) return;
    users.forEach(user => {
      if (user.socketId !== socket.id && !peerConnectionsRef.current.has(user.socketId)) {
        createPeerConnection(user.socketId, user.username);
      }
    });
  }, [socket, createPeerConnection]);

  useEffect(() => {
    if (!socket || !currentChannel) return;

    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('user-speaking', handleUserSpeaking);
    socket.on('users-in-channel', handleUsersInChannel);

    return () => {
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('user-speaking', handleUserSpeaking);
      socket.off('users-in-channel', handleUsersInChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, currentChannel, handleOffer, handleAnswer, handleIceCandidate, handleUserSpeaking, handleUsersInChannel]);

  useEffect(() => {
    if (!pushToTalkEnabled || !pushToTalkKey || !isMicOn) return;

    const handleKeyDown = (e) => {
      if (isMuted) return;
      const keyCode = e.code || e.keyCode;
      if (keyCode === pushToTalkKey && !pushToTalkActiveRef.current) {
        pushToTalkActiveRef.current = true;
        if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = true;
          });
        }
        if (socket) {
          socket.emit('push-to-talk-start');
        }
      }
    };

    const handleKeyUp = (e) => {
      const keyCode = e.code || e.keyCode;
      if (keyCode === pushToTalkKey && pushToTalkActiveRef.current) {
        pushToTalkActiveRef.current = false;
        if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = false;
          });
        }
        if (socket) {
          socket.emit('push-to-talk-stop');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pushToTalkEnabled, pushToTalkKey, isMicOn, isMuted, socket]);

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (speakingCheckIntervalRef.current) {
        clearInterval(speakingCheckIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      peerConnectionsRef.current.forEach(peerConnection => {
        peerConnection.close();
      });
      peerConnectionsRef.current.clear();
      setPeers(new Map());
    };
  }, []);

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      localStreamRef.current = stream;
      setIsMicOn(true);

      if (pushToTalkEnabled) {
        stream.getAudioTracks().forEach(track => {
          track.enabled = false;
        });
      }

      if (!pushToTalkEnabled) {
        setupSpeakingDetection(stream);
      }

      peerConnectionsRef.current.forEach((peerConnection) => {
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
      });

      peerConnectionsRef.current.forEach((peerConnection, socketId) => {
        createOffer(socketId, peerConnection);
      });

      return true;
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
      return false;
    }
  };

  const stopMicrophone = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setIsMicOn(false);
    setIsSpeaking(false);
    pushToTalkActiveRef.current = false;
    
    if (speakingCheckIntervalRef.current) {
      clearInterval(speakingCheckIntervalRef.current);
    }
  };

  const setupSpeakingDetection = (stream) => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkSpeaking = () => {
        if (!analyserRef.current || pushToTalkEnabled) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const threshold = 30;
        
        setIsSpeaking(prev => {
          const nowSpeaking = average > threshold;
          if (nowSpeaking !== prev && socket) {
            socket.emit('audio-speaking', { isSpeaking: nowSpeaking });
          }
          return nowSpeaking;
        });
      };

      speakingCheckIntervalRef.current = setInterval(checkSpeaking, 100);
    } catch (error) {
      console.error('Erro ao configurar detecção de fala:', error);
    }
  };

  const toggleMicrophone = async () => {
    if (isMicOn) {
      stopMicrophone();
    } else {
      await startMicrophone();
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMuted && (!pushToTalkEnabled || pushToTalkActiveRef.current);
      });
    }
    
    if (socket) {
      socket.emit('toggle-mute', { muted: newMuted });
    }
  };

  const setPushToTalk = (enabled, key) => {
    setPushToTalkEnabled(enabled);
    setPushToTalkKey(key);
    
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        if (enabled) {
          track.enabled = false;
        } else {
          track.enabled = !isMuted;
        }
      });
    }
    
    if (socket) {
      socket.emit('set-push-to-talk', { enabled, key });
    }
  };

  return {
    isMicOn,
    isSpeaking,
    audioEnabled,
    isMuted,
    pushToTalkEnabled,
    pushToTalkKey,
    peers,
    speakingUsers,
    toggleMicrophone,
    toggleMute,
    setAudioEnabled,
    setPushToTalk
  };
}
