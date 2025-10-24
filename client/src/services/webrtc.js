import { io } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

class WebRTCService {
  constructor() {
    this.socket = null;
    this.localStream = null;
    this.screenStream = null;
    this.peers = new Map();
    this.roomId = null;
    this.userId = null;
    this.userName = null;
    this.isHost = false;
    this.callbacks = {};
  }

  connect(serverUrl) {
    this.socket = io(serverUrl || 'http://localhost:3000', {
      transports: ['websocket'],
      reconnection: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.callbacks.onConnected?.();
    });

    this.socket.on('room-joined', ({ participants, totalAttendees }) => {
      console.log('Room joined, participants:', participants);
      this.callbacks.onRoomJoined?.({ participants, totalAttendees });
      
      participants.forEach(({ socketId }) => {
        if (socketId !== this.socket.id) {
          this.createPeerConnection(socketId, true);
        }
      });
    });

    this.socket.on('user-joined', async ({ socketId, userId, userName, isHost, audioEnabled, videoEnabled, totalAttendees }) => {
      console.log('User joined:', userName);
      this.callbacks.onUserJoined?.({ socketId, userId, userName, isHost, audioEnabled, videoEnabled, totalAttendees });
      this.createPeerConnection(socketId, false);
    });

    this.socket.on('offer', async ({ from, offer }) => {
      console.log('Received offer from:', from);
      const pc = this.peers.get(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.socket.emit('answer', { to: from, answer });
      }
    });

    this.socket.on('answer', async ({ from, answer }) => {
      console.log('Received answer from:', from);
      const pc = this.peers.get(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    this.socket.on('ice-candidate', async ({ from, candidate }) => {
      const pc = this.peers.get(from);
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    this.socket.on('user-left', ({ socketId }) => {
      console.log('User left:', socketId);
      this.callbacks.onUserLeft?.(socketId);
      this.closePeerConnection(socketId);
    });

    this.socket.on('user-audio-toggled', ({ socketId, enabled }) => {
      this.callbacks.onUserAudioToggled?.(socketId, enabled);
    });

    this.socket.on('user-video-toggled', ({ socketId, enabled }) => {
      this.callbacks.onUserVideoToggled?.(socketId, enabled);
    });

    this.socket.on('user-screen-share-started', ({ socketId }) => {
      this.callbacks.onUserScreenShareStarted?.(socketId);
    });

    this.socket.on('user-screen-share-stopped', ({ socketId }) => {
      this.callbacks.onUserScreenShareStopped?.(socketId);
    });

    this.socket.on('chat-message', ({ socketId, message, userName, timestamp }) => {
      this.callbacks.onChatMessage?.({ socketId, message, userName, timestamp });
    });

    this.socket.on('hand-raised', ({ socketId, userName }) => {
      this.callbacks.onHandRaised?.(socketId, userName);
    });

    this.socket.on('reaction', ({ socketId, reaction, userName }) => {
      this.callbacks.onReaction?.(socketId, reaction, userName);
    });

    this.socket.on('host-assigned', ({ socketId }) => {
      this.callbacks.onHostAssigned?.(socketId);
    });

    this.socket.on('removed-from-room', () => {
      this.callbacks.onRemovedFromRoom?.();
      this.leaveRoom();
    });

    this.socket.on('force-mute', () => {
      this.callbacks.onForceMute?.();
      this.toggleAudio(false);
    });

    this.socket.on('host-left', () => {
      this.callbacks.onHostLeft?.();
    });

    this.socket.on('waiting-for-host', () => {
      this.callbacks.onWaitingForHost?.();
    });
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }

  async joinRoom(roomId, userId, userName, isHost = false, audioEnabled = false, videoEnabled = false) {
    this.roomId = roomId;
    this.userId = userId;
    this.userName = userName;
    this.isHost = isHost;

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.callbacks.onLocalStream?.(this.localStream);
      this.socket.emit('join-room', { roomId, userId, userName, isHost, audioEnabled, videoEnabled });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  createPeerConnection(socketId, isInitiator) {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', { to: socketId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track from:', socketId);
      this.callbacks.onRemoteStream?.(socketId, event.streams[0]);
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        this.closePeerConnection(socketId);
      }
    };

    this.peers.set(socketId, pc);

    if (isInitiator) {
      this.createOffer(socketId);
    }

    return pc;
  }

  async createOffer(socketId) {
    const pc = this.peers.get(socketId);
    if (pc) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.socket.emit('offer', { to: socketId, offer });
    }
  }

  closePeerConnection(socketId) {
    const pc = this.peers.get(socketId);
    if (pc) {
      pc.close();
      this.peers.delete(socketId);
    }
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      this.socket.emit('toggle-audio', { roomId: this.roomId, enabled });
    }
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      this.socket.emit('toggle-video', { roomId: this.roomId, enabled });
    }
  }

  async startScreenShare() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });

      const screenTrack = this.screenStream.getVideoTracks()[0];
      
      this.peers.forEach((pc) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      screenTrack.onended = () => {
        this.stopScreenShare();
      };

      this.socket.emit('screen-share-started', { roomId: this.roomId });
      return this.screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      
      const videoTrack = this.localStream.getVideoTracks()[0];
      this.peers.forEach((pc) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });

      this.screenStream = null;
      this.socket.emit('screen-share-stopped', { roomId: this.roomId });
    }
  }

  sendChatMessage(message) {
    this.socket.emit('chat-message', { roomId: this.roomId, message, userName: this.userName });
  }

  raiseHand() {
    this.socket.emit('raise-hand', { roomId: this.roomId, userName: this.userName });
  }

  sendReaction(reaction) {
    this.socket.emit('reaction', { roomId: this.roomId, reaction, userName: this.userName });
  }

  assignHost(targetSocketId) {
    this.socket.emit('assign-host', { roomId: this.roomId, targetSocketId });
  }

  removeParticipant(targetSocketId) {
    this.socket.emit('remove-participant', { roomId: this.roomId, targetSocketId });
  }

  muteParticipant(targetSocketId) {
    this.socket.emit('mute-participant', { roomId: this.roomId, targetSocketId });
  }

  leaveRoom() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
    }
    
    this.peers.forEach((pc) => pc.close());
    this.peers.clear();

    if (this.socket && this.roomId) {
      this.socket.emit('leave-room', { roomId: this.roomId });
    }

    this.localStream = null;
    this.screenStream = null;
    this.roomId = null;
  }

  disconnect() {
    this.leaveRoom();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new WebRTCService();
