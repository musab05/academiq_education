import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare, Monitor, Hand, Circle, Smile } from 'lucide-react';
import { teamAPI, recordingAPI } from '../services/api';
import webrtcService from '../services/webrtc';

const TeamMeetingPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const [team, setTeam] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [pinnedParticipant, setPinnedParticipant] = useState(null);
  const [raisedHands, setRaisedHands] = useState(new Set());
  const [reactions, setReactions] = useState([]);
  const [showReactions, setShowReactions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showPreJoinModal, setShowPreJoinModal] = useState(true);
  const [preJoinAudio, setPreJoinAudio] = useState(false);
  const [preJoinVideo, setPreJoinVideo] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [previewStream, setPreviewStream] = useState(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const previewVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    if (hasJoined) {
      initializeWebRTC();
    }
    return () => {
      if (isRecording) stopRecording();
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      webrtcService.disconnect();
    };
  }, [teamId, hasJoined]);

  const initializeWebRTC = async () => {
    try {
      const response = await teamAPI.getTeams();
      const foundTeam = response.data.find(t => t._id === teamId);
      setTeam(foundTeam);

      webrtcService.connect();

      webrtcService.on('onLocalStream', (stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      });

      webrtcService.on('onRoomJoined', (data) => {
        setParticipants(data.participants || []);
      });

      webrtcService.on('onUserJoined', (user) => {
        setParticipants(prev => [...prev, user]);
      });

      webrtcService.on('onUserLeft', (socketId) => {
        setParticipants(prev => prev.filter(p => p.socketId !== socketId));
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(socketId);
          return newMap;
        });
      });

      webrtcService.on('onRemoteStream', (socketId, stream) => {
        setRemoteStreams(prev => new Map(prev).set(socketId, stream));
      });

      webrtcService.on('onUserAudioToggled', (socketId, enabled) => {
        setParticipants(prev => prev.map(p => 
          p.socketId === socketId ? { ...p, audioEnabled: enabled } : p
        ));
      });

      webrtcService.on('onUserVideoToggled', (socketId, enabled) => {
        console.log('User video toggled:', socketId, enabled);
        setParticipants(prev => {
          const updated = prev.map(p => 
            p.socketId === socketId ? { ...p, videoEnabled: enabled } : p
          );
          console.log('Updated participants:', updated);
          return updated;
        });
      });

      webrtcService.on('onChatMessage', (msg) => {
        setChatMessages(prev => [...prev, msg]);
      });

      webrtcService.on('onHandRaised', (socketId, userName) => {
        setRaisedHands(prev => new Set(prev).add(socketId));
        setTimeout(() => {
          setRaisedHands(prev => {
            const newSet = new Set(prev);
            newSet.delete(socketId);
            return newSet;
          });
        }, 10000);
      });

      setIsMuted(!preJoinAudio);
      setIsVideoOff(!preJoinVideo);
      
      await webrtcService.joinRoom(
        `team-${teamId}`,
        user._id,
        `${user.firstName} ${user.lastName}`,
        false,
        preJoinAudio,
        preJoinVideo
      );
      
      if (!preJoinAudio) webrtcService.toggleAudio(false);
      if (!preJoinVideo) webrtcService.toggleVideo(false);
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      alert('Failed to join meeting');
      navigate(`/teams/${teamId}`);
    }
  };

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    webrtcService.toggleAudio(!newState);
  };

  const toggleVideo = () => {
    const newState = !isVideoOff;
    setIsVideoOff(newState);
    webrtcService.toggleVideo(!newState);
    
    setTimeout(() => {
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }, 100);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      webrtcService.stopScreenShare();
      setIsScreenSharing(false);
    } else {
      try {
        await webrtcService.startScreenShare();
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      webrtcService.sendChatMessage(message);
      setMessage('');
    }
  };

  const handleEndCall = () => {
    webrtcService.leaveRoom();
    navigate(`/teams/${teamId}`);
  };

  const raiseHand = () => {
    webrtcService.raiseHand();
    setRaisedHands(prev => new Set(prev).add('local'));
    setTimeout(() => {
      setRaisedHands(prev => {
        const newSet = new Set(prev);
        newSet.delete('local');
        return newSet;
      });
    }, 10000);
  };

  const sendReaction = (emoji) => {
    const reaction = { id: Date.now(), emoji, x: Math.random() * 80 + 10 };
    setReactions(prev => [...prev, reaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 3000);
    setShowReactions(false);
  };

  const startRecording = async () => {
    try {
      if (!localStreamRef.current) {
        alert('No media stream available');
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      
      const audioContext = new AudioContext();
      const audioDestination = audioContext.createMediaStreamDestination();
      
      if (localStreamRef.current.getAudioTracks().length > 0) {
        const audioSource = audioContext.createMediaStreamSource(localStreamRef.current);
        audioSource.connect(audioDestination);
      }
      
      remoteStreams.forEach(stream => {
        if (stream.getAudioTracks().length > 0) {
          const audioSource = audioContext.createMediaStreamSource(stream);
          audioSource.connect(audioDestination);
        }
      });
      
      const videoElements = new Map();
      remoteStreams.forEach((stream, socketId) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.play();
        videoElements.set(socketId, video);
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks()
      ]);
      
      let isRecordingActive = true;
      const drawFrame = () => {
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const totalParticipants = 1 + remoteStreams.size;
        const cols = Math.ceil(Math.sqrt(totalParticipants));
        const rows = Math.ceil(totalParticipants / cols);
        const tileWidth = canvas.width / cols;
        const tileHeight = canvas.height / rows;
        
        let index = 0;
        
        if (localVideoRef.current && localVideoRef.current.readyState >= 2 && !isVideoOff) {
          const col = index % cols;
          const row = Math.floor(index / cols);
          ctx.drawImage(localVideoRef.current, col * tileWidth, row * tileHeight, tileWidth, tileHeight);
          index++;
        }
        
        videoElements.forEach((video, socketId) => {
          if (video.readyState >= 2) {
            const col = index % cols;
            const row = Math.floor(index / cols);
            ctx.drawImage(video, col * tileWidth, row * tileHeight, tileWidth, tileHeight);
            index++;
          }
        });
        
        if (isRecordingActive) requestAnimationFrame(drawFrame);
      };
      drawFrame();
      
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : 'video/webm';
      
      mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType });
      recordedChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          console.log('Recorded chunk:', event.data.size, 'bytes');
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        isRecordingActive = false;
        videoElements.forEach(video => {
          video.srcObject = null;
        });
        videoElements.clear();
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        console.log('Recording stopped. Total size:', blob.size, 'bytes');
        
        if (blob.size === 0) {
          alert('Recording is empty. Please try again.');
          return;
        }
        
        const formData = new FormData();
        formData.append('recording', blob, `recording-${Date.now()}.webm`);
        formData.append('teamId', teamId);
        formData.append('title', `${team?.name || 'Team'} Meeting Recording`);
        formData.append('duration', recordingTime);
        
        console.log('Uploading recording...', {
          teamId,
          title: team?.name,
          duration: recordingTime,
          size: blob.size
        });
        
        try {
          const response = await recordingAPI.uploadRecording(formData);
          console.log('Recording uploaded:', response.data);
          alert('Recording saved successfully!');
        } catch (error) {
          console.error('Upload error:', error);
          alert(`Failed to save recording: ${error.response?.data?.message || error.message}`);
        }
      };
      
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (showPreJoinModal) {
      startPreview();
    }
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showPreJoinModal]);

  useEffect(() => {
    if (previewStream && previewVideoRef.current) {
      previewVideoRef.current.srcObject = previewStream;
      if (preJoinVideo) {
        previewStream.getVideoTracks().forEach(track => track.enabled = true);
      } else {
        previewStream.getVideoTracks().forEach(track => track.enabled = false);
      }
    }
  }, [preJoinVideo, previewStream]);

  useEffect(() => {
    if (previewStream) {
      previewStream.getAudioTracks().forEach(track => track.enabled = preJoinAudio);
    }
  }, [preJoinAudio]);

  const startPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      stream.getVideoTracks().forEach(track => track.enabled = false);
      stream.getAudioTracks().forEach(track => track.enabled = false);
      setPreviewStream(stream);
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const handleJoinMeeting = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
    }
    setShowPreJoinModal(false);
    setHasJoined(true);
  };
  
  if (showPreJoinModal) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Ready to join?</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{team?.name || 'Team Meeting'}</p>
            
            <div className="relative bg-gray-900 rounded-lg sm:rounded-xl overflow-hidden mb-4 sm:mb-6 aspect-video">
              {preJoinVideo ? (
                <video
                  ref={previewVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl sm:text-4xl md:text-5xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3">
                <button
                  onClick={() => setPreJoinAudio(!preJoinAudio)}
                  className={`p-3 sm:p-4 rounded-full transition-all shadow-lg tap-target ${
                    preJoinAudio ? 'bg-white text-gray-900' : 'bg-red-500 text-white'
                  }`}
                >
                  {preJoinAudio ? <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>
                <button
                  onClick={() => setPreJoinVideo(!preJoinVideo)}
                  className={`p-3 sm:p-4 rounded-full transition-all shadow-lg tap-target ${
                    preJoinVideo ? 'bg-white text-gray-900' : 'bg-red-500 text-white'
                  }`}
                >
                  {preJoinVideo ? <Video className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${preJoinAudio ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Microphone: {preJoinAudio ? 'Enabled' : 'Muted'}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${preJoinVideo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Camera: {preJoinVideo ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            <button
              onClick={handleJoinMeeting}
              className="w-full py-3 sm:py-4 bg-orange-500 text-white rounded-lg sm:rounded-xl hover:bg-orange-600 font-semibold text-base sm:text-lg transition-colors shadow-lg tap-target"
            >
              Join Meeting
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!team) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      <div className="bg-gray-800 border-b border-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between shadow-lg">
        <div className="min-w-0 flex-1">
          <h1 className="text-white font-bold text-sm sm:text-base md:text-lg truncate">{team?.name || 'Team Meeting'}</h1>
          <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{participants.length + 1} in meeting</span>
          </p>
        </div>
      </div>

      <div className="flex-1 flex relative bg-gray-900 overflow-hidden">
        {pinnedParticipant ? (
          <>
            <div className="flex-1 flex flex-col p-2 sm:p-3 md:p-4 gap-2 sm:gap-3 md:gap-4 overflow-hidden max-w-5xl mx-auto">
              <div className="flex-1 bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-700 overflow-hidden relative">
                <RemoteVideo 
                  stream={remoteStreams.get(pinnedParticipant)} 
                  participant={participants.find(p => p.socketId === pinnedParticipant)}
                  isPinned
                  onUnpin={() => setPinnedParticipant(null)}
                  isFocused
                />
              </div>
            </div>
            <div className="hidden lg:block w-60 xl:w-80 p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 overflow-y-auto">
              <div className="relative bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden h-40 sm:h-48 lg:h-56">
                {isVideoOff ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                  </div>
                ) : (
                  <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 bg-gray-900/80 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium text-white">
                  You
                </div>
                {isMuted && <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-red-500 p-1 rounded"><MicOff className="w-3 h-3 text-white" /></div>}
              </div>
              {Array.from(remoteStreams.entries()).map(([socketId, stream]) => {
                if (socketId === pinnedParticipant) return null;
                const participant = participants.find(p => p.socketId === socketId);
                return (
                  <div key={socketId} className="relative bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden h-40 sm:h-48 lg:h-56 cursor-pointer hover:border-orange-500 tap-target" onClick={() => setPinnedParticipant(socketId)}>
                    <RemoteVideo stream={stream} participant={participant} />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex-1 p-2 sm:p-3 md:p-4 overflow-hidden">
            <div className="h-full grid gap-1.5 sm:gap-2 sm:!grid-cols-2 md:!grid-cols-3 lg:!grid-cols-4" style={{ 
              gridTemplateColumns: remoteStreams.size === 0 ? '1fr' : 
                                  remoteStreams.size === 1 ? 'repeat(1, 1fr)' :
                                  remoteStreams.size === 2 ? 'repeat(2, 1fr)' :
                                  remoteStreams.size <= 5 ? 'repeat(2, 1fr)' :
                                  'repeat(3, 1fr)',
              gridTemplateRows: remoteStreams.size <= 2 ? '1fr' :
                                remoteStreams.size <= 5 ? 'repeat(2, 1fr)' :
                                'repeat(3, 1fr)'
            }}>
              <div className="relative bg-gray-800 rounded overflow-hidden border-2 border-transparent hover:border-orange-500 transition-colors">
                {isVideoOff ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                  </div>
                ) : (
                  <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-1 sm:bottom-1.5 md:bottom-2 left-1 sm:left-1.5 md:left-2 bg-black/70 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs text-white font-medium">
                  You
                </div>
                {isMuted && <div className="absolute top-1 sm:top-1.5 md:top-2 right-1 sm:right-1.5 md:right-2 bg-red-500 p-1 sm:p-1.5 rounded-full"><MicOff className="w-3 h-3 sm:w-4 sm:h-4 text-white" /></div>}
                {raisedHands.has('local') && <div className="absolute top-1 sm:top-1.5 md:top-2 left-1 sm:left-1.5 md:left-2 bg-yellow-500 p-1 sm:p-1.5 rounded-full animate-bounce"><Hand className="w-3 h-3 sm:w-4 sm:h-4 text-white" /></div>}
              </div>
              {Array.from(remoteStreams.entries()).map(([socketId, stream]) => {
                const participant = participants.find(p => p.socketId === socketId);
                return (
                  <div key={socketId} className="relative bg-gray-800 rounded overflow-hidden border-2 border-transparent hover:border-orange-500 transition-colors cursor-pointer tap-target" onClick={() => setPinnedParticipant(socketId)}>
                    <RemoteVideo stream={stream} participant={participant} raisedHand={raisedHands.has(socketId)} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showChat && (
          <div className="absolute lg:relative inset-0 lg:inset-auto w-full lg:w-72 xl:w-80 bg-gray-800 border-l border-gray-700 flex flex-col shadow-lg z-10">
            <div className="p-3 sm:p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-bold text-sm sm:text-base">Chat</h3>
              <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-gray-300 text-2xl sm:text-3xl leading-none tap-target">
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="bg-gray-700 rounded-lg p-2.5 sm:p-3 border border-gray-600">
                  <div className="text-xs text-gray-400 font-medium truncate">{msg.userName}</div>
                  <div className="text-white text-xs sm:text-sm mt-1 break-words">{msg.message}</div>
                </div>
              ))}
            </div>
            <div className="p-3 sm:p-4 border-t border-gray-700 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white px-2.5 sm:px-3 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-xs sm:text-sm"
              />
              <button onClick={sendMessage} className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-xs sm:text-sm tap-target">
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 border-t border-gray-700 p-2 sm:p-3 md:p-4 flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 shadow-lg relative overflow-x-auto">
        {reactions.map(r => (
          <div key={r.id} className="absolute bottom-16 sm:bottom-20 text-2xl sm:text-3xl md:text-4xl animate-float" style={{ left: `${r.x}%`, animation: 'float 3s ease-out forwards' }}>
            {r.emoji}
          </div>
        ))}
        <button
          onClick={toggleMute}
          className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all shadow-lg tap-target ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all shadow-lg tap-target ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`hidden sm:flex p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all shadow-lg tap-target ${
            isScreenSharing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>

        <button onClick={raiseHand} className={`hidden sm:flex p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-lg tap-target ${raisedHands.has('local') ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          <Hand className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>

        <div className="relative hidden sm:block">
          <button onClick={() => setShowReactions(!showReactions)} className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-gray-700 hover:bg-gray-600 shadow-lg tap-target">
            <Smile className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
          {showReactions && (
            <div className="absolute bottom-14 sm:bottom-16 left-0 bg-gray-700 rounded-lg p-2 flex gap-2 shadow-xl border border-gray-600">
              {['👍', '❤️', '😂', '👏', '🎉'].map(emoji => (
                <button key={emoji} onClick={() => sendReaction(emoji)} className="text-xl sm:text-2xl hover:scale-125 transition-transform p-1 tap-target">
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => setShowChat(!showChat)} className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-gray-700 hover:bg-gray-600 shadow-lg tap-target">
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`hidden md:flex p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-lg items-center gap-2 tap-target ${
            isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Circle className={`w-5 h-5 sm:w-6 sm:h-6 text-white ${isRecording ? 'fill-white' : ''}`} />
          {isRecording && <span className="text-white text-xs sm:text-sm font-medium">{formatTime(recordingTime)}</span>}
        </button>

        <div className="w-px h-8 sm:h-10 bg-gray-700 mx-1 sm:mx-2" />

        <button onClick={handleEndCall} className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-red-500 hover:bg-red-600 shadow-lg tap-target">
          <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
      </div>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const RemoteVideo = ({ stream, participant, isPinned, onPin, onUnpin, isFocused, raisedHand }) => {
  const videoRef = useRef(null);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    forceUpdate({});
  }, [participant?.videoEnabled]);

  if (isPinned) {
    return (
      <div className="w-full h-full bg-gray-800 relative">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover" 
          style={{ display: participant?.videoEnabled === false ? 'none' : 'block' }}
        />
        {participant?.videoEnabled === false && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold">
              {participant?.userName?.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        )}
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 bg-gray-900/80 px-2 sm:px-3 py-1 rounded-lg">
          <p className="text-white text-xs sm:text-sm font-medium truncate max-w-[200px] sm:max-w-none">{participant?.userName}</p>
        </div>
        <button onClick={onUnpin} className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-gray-900/80 p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 tap-target">
          <span className="text-white text-xs sm:text-sm">Unpin</span>
        </button>
        {!participant?.audioEnabled && (
          <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-red-500 p-1.5 sm:p-2 rounded-lg">
            <MicOff className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden border-2 border-gray-700 relative cursor-pointer hover:border-orange-500" onClick={onPin}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover" 
        style={{ display: participant?.videoEnabled === false ? 'none' : 'block' }}
      />
      {participant?.videoEnabled === false && (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold">
            {participant?.userName?.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      )}
      <div className="absolute bottom-1 sm:bottom-1.5 md:bottom-2 left-1 sm:left-1.5 md:left-2 bg-gray-900/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs text-white truncate max-w-[calc(100%-1rem)]">
        {participant?.userName}
      </div>
      {!participant?.audioEnabled && (
        <div className="absolute top-1 sm:top-1.5 md:top-2 right-1 sm:right-1.5 md:right-2 bg-red-500 p-1 rounded">
          <MicOff className="w-3 h-3 text-white" />
        </div>
      )}
      {raisedHand && (
        <div className="absolute top-1 sm:top-1.5 md:top-2 left-1 sm:left-1.5 md:left-2 bg-yellow-500 p-1 rounded animate-bounce">
          <Hand className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
};

export default TeamMeetingPage;
