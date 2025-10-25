import { Server } from 'socket.io';

const rooms = new Map();
const userAttendance = new Map(); // Track unique users per room

let ioInstance = null;

export const initializeSignalingServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user's personal notification room
    socket.on('join-notifications', ({ userId }) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined notifications`);
    });

    socket.on('join-room', ({ roomId, userId, userName, isHost, audioEnabled = false, videoEnabled = false }) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { participants: new Map(), hosts: new Set(), waiting: new Map() });
      }
      
      if (!userAttendance.has(roomId)) {
        userAttendance.set(roomId, new Set());
      }
      
      const room = rooms.get(roomId);
      const attendance = userAttendance.get(roomId);
      
      // Check if host is present
      const hasHost = room.hosts.size > 0 || isHost;
      
      if (!isHost && !hasHost) {
        // Put non-host in waiting room
        room.waiting.set(socket.id, { userId, userName, isHost: false, audioEnabled, videoEnabled });
        socket.emit('waiting-for-host');
        console.log(`${userName} is waiting for host in room ${roomId}`);
        return;
      }
      
      room.participants.set(socket.id, { userId, userName, isHost, audioEnabled, videoEnabled });
      attendance.add(userId);
      
      if (isHost) {
        room.hosts.add(socket.id);
        
        // Admit all waiting participants
        room.waiting.forEach((waitingUser, waitingSocketId) => {
          room.participants.set(waitingSocketId, waitingUser);
          attendance.add(waitingUser.userId);
          
          const waitingSocket = io.sockets.sockets.get(waitingSocketId);
          if (waitingSocket) {
            const participants = Array.from(room.participants.entries())
              .filter(([id]) => id !== waitingSocketId)
              .map(([id, data]) => ({ socketId: id, ...data }));
            
            waitingSocket.emit('room-joined', { participants, totalAttendees: attendance.size });
            socket.to(roomId).emit('user-joined', { 
              socketId: waitingSocketId, 
              ...waitingUser,
              totalAttendees: attendance.size,
            });
          }
        });
        room.waiting.clear();
      }

      const participants = Array.from(room.participants.entries())
        .filter(([id]) => id !== socket.id)
        .map(([id, data]) => ({
          socketId: id,
          ...data,
        }));

      socket.emit('room-joined', { participants, totalAttendees: attendance.size });
      socket.to(roomId).emit('user-joined', { 
        socketId: socket.id, 
        userId, 
        userName, 
        isHost,
        audioEnabled,
        videoEnabled,
        totalAttendees: attendance.size,
      });

      console.log(`${userName} joined room ${roomId} (audio: ${audioEnabled}, video: ${videoEnabled})`);
    });

    socket.on('offer', ({ to, offer }) => {
      socket.to(to).emit('offer', { from: socket.id, offer });
    });

    socket.on('answer', ({ to, answer }) => {
      socket.to(to).emit('answer', { from: socket.id, answer });
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
      socket.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });

    socket.on('toggle-audio', ({ roomId, enabled }) => {
      const room = rooms.get(roomId);
      if (room && room.participants.has(socket.id)) {
        room.participants.get(socket.id).audioEnabled = enabled;
        socket.to(roomId).emit('user-audio-toggled', { socketId: socket.id, enabled });
      }
    });

    socket.on('toggle-video', ({ roomId, enabled }) => {
      const room = rooms.get(roomId);
      if (room && room.participants.has(socket.id)) {
        room.participants.get(socket.id).videoEnabled = enabled;
        console.log(`User ${socket.id} toggled video to ${enabled} in room ${roomId}`);
        socket.to(roomId).emit('user-video-toggled', { socketId: socket.id, enabled });
      }
    });

    socket.on('screen-share-started', ({ roomId }) => {
      socket.to(roomId).emit('user-screen-share-started', { socketId: socket.id });
    });

    socket.on('screen-share-stopped', ({ roomId }) => {
      socket.to(roomId).emit('user-screen-share-stopped', { socketId: socket.id });
    });

    socket.on('chat-message', ({ roomId, message, userName }) => {
      io.to(roomId).emit('chat-message', { 
        socketId: socket.id, 
        message, 
        userName, 
        timestamp: Date.now() 
      });
    });

    socket.on('join-team-chat', ({ teamId, userId }) => {
      socket.join(`team-${teamId}`);
      console.log(`User ${userId} joined team chat ${teamId}`);
    });

    socket.on('team-message', ({ teamId, message }) => {
      io.to(`team-${teamId}`).emit('team-message', message);
    });

    socket.on('leave-team-chat', ({ teamId }) => {
      socket.leave(`team-${teamId}`);
    });

    socket.on('raise-hand', ({ roomId, userName }) => {
      socket.to(roomId).emit('hand-raised', { socketId: socket.id, userName });
    });

    socket.on('reaction', ({ roomId, reaction, userName }) => {
      socket.to(roomId).emit('reaction', { socketId: socket.id, reaction, userName });
    });

    socket.on('assign-host', ({ roomId, targetSocketId }) => {
      const room = rooms.get(roomId);
      if (room && room.hosts.has(socket.id)) {
        room.hosts.add(targetSocketId);
        const participant = room.participants.get(targetSocketId);
        if (participant) {
          participant.isHost = true;
        }
        io.to(roomId).emit('host-assigned', { socketId: targetSocketId });
      }
    });

    socket.on('remove-participant', ({ roomId, targetSocketId }) => {
      const room = rooms.get(roomId);
      if (room && room.hosts.has(socket.id)) {
        io.to(targetSocketId).emit('removed-from-room');
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.leave(roomId);
        }
        room.participants.delete(targetSocketId);
        socket.to(roomId).emit('user-left', { socketId: targetSocketId });
      }
    });

    socket.on('mute-participant', ({ roomId, targetSocketId }) => {
      const room = rooms.get(roomId);
      if (room && room.hosts.has(socket.id)) {
        io.to(targetSocketId).emit('force-mute');
        room.participants.get(targetSocketId).audioEnabled = false;
        socket.to(roomId).emit('user-audio-toggled', { socketId: targetSocketId, enabled: false });
      }
    });

    socket.on('leave-room', ({ roomId }) => {
      handleLeaveRoom(socket, roomId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      rooms.forEach((room, roomId) => {
        if (room.participants.has(socket.id)) {
          handleLeaveRoom(socket, roomId);
        }
      });
    });
  });

  const handleLeaveRoom = (socket, roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      const wasHost = room.hosts.has(socket.id);
      const wasWaiting = room.waiting.has(socket.id);
      
      room.participants.delete(socket.id);
      room.hosts.delete(socket.id);
      room.waiting.delete(socket.id);
      
      if (wasHost && room.participants.size > 0) {
        io.to(roomId).emit('host-left');
        room.participants.clear();
        room.hosts.clear();
        room.waiting.clear();
        rooms.delete(roomId);
        if (userAttendance.has(roomId)) {
          userAttendance.delete(roomId);
        }
      } else if (!wasWaiting) {
        socket.to(roomId).emit('user-left', { socketId: socket.id });
        if (room.participants.size === 0 && room.waiting.size === 0) {
          rooms.delete(roomId);
          if (userAttendance.has(roomId)) {
            userAttendance.delete(roomId);
          }
        }
      }
    }
    socket.leave(roomId);
  };

  return io;
};

export const emitNotification = (userId, notification) => {
  if (ioInstance) {
    ioInstance.to(`user-${userId}`).emit('new-notification', notification);
  }
};

export const emitRoleUpdate = (userId, newRole) => {
  if (ioInstance) {
    ioInstance.to(`user-${userId}`).emit('role-updated', { role: newRole });
  }
};
