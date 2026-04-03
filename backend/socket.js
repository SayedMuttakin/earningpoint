const { Server } = require('socket.io');
const ChatSession = require('./models/ChatSession');

let io;

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      // User requests support
      socket.on('request_support', async (data) => {
        try {
          const { name, email, userId } = data;
          
          let session = await ChatSession.create({
            name,
            email,
            userId: userId || null, // Optional if logged in
            status: 'active'
          });

          // Join the socket room for this specific session
          socket.join(session._id.toString());
          
          // Notify the user their session is created
          socket.emit('session_created', { sessionId: session._id });

          // Broadcast to admin room (admins should join a special room)
          io.to('admin_room').emit('new_support_request', session);

        } catch (err) {
          console.error('Socket error request_support:', err);
        }
      });

      // Admin joins the session
      socket.on('admin_join', async (data) => {
        try {
          const { sessionId } = data;
          
          let session = await ChatSession.findById(sessionId);
          if (session) {
            session.adminJoined = true;
            await session.save();

            socket.join(sessionId);
            
            // Notify the user in the room
            io.to(sessionId).emit('admin_joined', { message: 'Admin has joined the chat' });
          }
        } catch (err) {
          console.error('Socket error admin_join:', err);
        }
      });

      // Handle message
      socket.on('send_message', async (data) => {
        try {
          const { sessionId, sender, content } = data;
          
          let session = await ChatSession.findById(sessionId);
          if (session) {
            const message = {
              sender,
              content,
              timestamp: new Date()
            };
            session.messages.push(message);
            await session.save();

            // Broadcast to everyone in the room
            io.to(sessionId).emit('receive_message', message);
          }
        } catch (err) {
          console.error('Socket error send_message:', err);
        }
      });

      // Typing indicators
      socket.on('typing', (data) => {
        const { sessionId, sender } = data;
        // broadcast to the room, but exclude the sender
        socket.to(sessionId).emit('typing', { sender });
      });

      // Close session
      socket.on('close_session', async (data) => {
        try {
          const { sessionId } = data;
          await ChatSession.findByIdAndUpdate(sessionId, { status: 'closed' });
          io.to(sessionId).emit('session_closed', { message: 'Chat session has been closed' });
        } catch (err) {
          console.error('Socket error close_session:', err);
        }
      });

      // Admin logic
      socket.on('join_admin_room', () => {
        socket.join('admin_room');
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
