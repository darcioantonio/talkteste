import { useState, useEffect, useRef } from 'react';

export function useAudio(socket, room) {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [peers, setPeers] = useState(new Map());
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const speakingCheckIntervalRef = useRef(null);

  useEffect(() => {
    if (!socket || !room) return;

    // Handlers WebRTC
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('user-speaking', handleUserSpeaking);
    socket.on('users-in-room', handleUsersInRoom);

    return () => {
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('user-speaking', handleUserSpeaking);
      socket.off('users-in-room', handleUsersInRoom);
    };
  }, [socket, room]);

  useEffect(() => {
    return () => {
      // Cleanup ao desmontar
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (speakingCheckIntervalRef.current) {
        clearInterval(speakingCheckIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      cleanupPeerConnections();
    };
  }, []);

  const handleOffer = async ({ offer, from, username }) => {
    try {
      const peerConnection = createPeerConnection(from, username);
      
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      socket.emit('webrtc-answer', {
        answer: answer,
        to: from
      });
    } catch (error) {
      console.error('Erro ao processar oferta:', error);
    }
  };

  const handleAnswer = async ({ answer, from, username }) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(from);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
    }
  };

  const handleIceCandidate = async ({ candidate, from }) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(from);
      if (peerConnection && candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Erro ao adicionar ICE candidate:', error);
    }
  };

  const handleUserSpeaking = ({ username, socketId, isSpeaking }) => {
    setSpeakingUsers(prev => {
      const newSet = new Set(prev);
      if (isSpeaking) {
        newSet.add(socketId);
      } else {
        newSet.delete(socketId);
      }
      return newSet;
    });
  };

  const handleUsersInRoom = (users) => {
    // Criar conexões para novos usuários (exceto nós mesmos)
    const currentSocketId = socket?.id;
    users.forEach(user => {
      if (user.socketId && user.socketId !== currentSocketId && !peerConnectionsRef.current.has(user.socketId)) {
        createPeerConnection(user.socketId, user.username);
      }
    });
    
    // Remover conexões de usuários que saíram
    const currentUserIds = new Set(users.map(u => u.socketId).filter(Boolean));
    peerConnectionsRef.current.forEach((peerConnection, socketId) => {
      if (!currentUserIds.has(socketId)) {
        peerConnection.close();
        peerConnectionsRef.current.delete(socketId);
        setPeers(prev => {
          const newMap = new Map(prev);
          newMap.delete(socketId);
          return newMap;
        });
      }
    });
  };

  const createPeerConnection = (socketId, username) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Adicionar stream local quando disponível
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    // Receber stream remoto
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setPeers(prev => {
        const newMap = new Map(prev);
        newMap.set(socketId, { stream: remoteStream, username });
        return newMap;
      });
    };

    // Enviar ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice-candidate', {
          candidate: event.candidate,
          to: socketId
        });
      }
    };

    peerConnectionsRef.current.set(socketId, peerConnection);

    // Criar oferta se temos stream local
    if (localStreamRef.current && isMicOn) {
      createOffer(socketId, peerConnection);
    }

    return peerConnection;
  };

  const createOffer = async (socketId, peerConnection) => {
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      socket.emit('webrtc-offer', {
        offer: offer,
        to: socketId
      });
    } catch (error) {
      console.error('Erro ao criar oferta:', error);
    }
  };

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

      // Configurar detecção de fala
      setupSpeakingDetection(stream);

      // Adicionar stream a todas as conexões existentes
      peerConnectionsRef.current.forEach((peerConnection) => {
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
      });

      // Criar ofertas para todos os peers
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
    
    if (speakingCheckIntervalRef.current) {
      clearInterval(speakingCheckIntervalRef.current);
    }

    // Notificar que parou de falar
    if (socket) {
      socket.emit('audio-speaking', { isSpeaking: false });
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
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const threshold = 30; // Ajuste conforme necessário
        
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

  const cleanupPeerConnections = () => {
    peerConnectionsRef.current.forEach(peerConnection => {
      peerConnection.close();
    });
    peerConnectionsRef.current.clear();
    setPeers(new Map());
  };

  const toggleMicrophone = async () => {
    if (isMicOn) {
      stopMicrophone();
    } else {
      await startMicrophone();
    }
  };

  return {
    isMicOn,
    isSpeaking,
    audioEnabled,
    peers,
    speakingUsers,
    toggleMicrophone,
    setAudioEnabled
  };
}

