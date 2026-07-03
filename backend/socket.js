const { Server } = require('socket.io');
const ChatSession = require('./models/ChatSession');
const Message = require('./models/Message');
const AdminNotification = require('./models/AdminNotification');
const User = require('./models/User');

let io;
const activeUsers = new Set();

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

          // Notify admin
          await AdminNotification.create({
            title: 'New Support Request 💬',
            message: `User ${name || 'Unknown'} (${email || 'No email'}) requested live support.`,
            type: 'support',
            referenceId: session._id.toString()
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

      // User rejoins an existing session
      socket.on('rejoin_session', async (data) => {
        try {
          const { sessionId } = data;
          const session = await ChatSession.findById(sessionId);
          if (session && session.status !== 'closed') {
            socket.join(sessionId);
            // If admin already joined, notify frontend
            if (session.adminJoined) {
              socket.emit('admin_joined', { message: 'Admin is in the chat' });
            }
            // Send existing messages
            if (session.messages && session.messages.length > 0) {
               socket.emit('previous_messages', session.messages);
            }
          } else {
            socket.emit('session_expired');
          }
        } catch (err) {
          console.error('Socket error rejoin_session:', err);
        }
      });

      // Get or create session for logged-in user
      socket.on('get_or_create_session', async (data) => {
        try {
          const { userId, name, email } = data;
          if (!userId) {
            socket.emit('session_error', { message: 'Authentication required' });
            return;
          }

          // Check if there is an active session for this user
          let session = await ChatSession.findOne({ userId, status: 'active' });
          if (!session) {
            session = await ChatSession.create({
              userId,
              name: name || 'User',
              email: email || 'user@zenivio.com',
              status: 'active',
              adminJoined: false
            });
            // Notify admin
            await AdminNotification.create({
              title: 'New Support Request 💬',
              message: `User ${name || 'User'} requested live support.`,
              type: 'support',
              referenceId: session._id.toString()
            });
            // Broadcast to admin room
            io.to('admin_room').emit('new_support_request', session);
          }

          socket.join(session._id.toString());
          socket.emit('session_created', { sessionId: session._id });

          // Send existing messages if any
          if (session.messages && session.messages.length > 0) {
            socket.emit('previous_messages', session.messages);
          } else {
            // Add a bot welcome message
            const welcomeMsg = {
              sender: 'admin',
              content: `Hello ${name || 'User'}! Welcome to Zenivio Support. How can we help you today?`,
              timestamp: new Date()
            };
            session.messages.push(welcomeMsg);
            await session.save();
            socket.emit('previous_messages', session.messages);
          }

          // If admin already joined, notify frontend
          if (session.adminJoined) {
            socket.emit('admin_joined', { message: 'Admin has joined the chat' });
          }
        } catch (err) {
          console.error('Socket error get_or_create_session:', err);
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

            if (sender === 'user') {
              await AdminNotification.create({
                title: 'New Support Message 💬',
                message: `User ${session.name} sent: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
                type: 'support',
                referenceId: session._id.toString()
              });
            }

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

      // Direct messaging room join
      socket.on('join_user_room', (data) => {
        try {
          const { userId } = data;
          if (userId) {
            socket.join(userId.toString());
            socket.userId = userId.toString();
            activeUsers.add(userId.toString());
            console.log(`Socket ${socket.id} joined private room ${userId}`);
            // Broadcast online users
            io.emit('online_users', Array.from(activeUsers));
          }
        } catch (err) {
          console.error('Socket join_user_room error:', err);
        }
      });

      // Send direct message
      socket.on('send_direct_message', async (data) => {
        try {
          const { senderId, receiverId, content, messageType } = data;
          if (!senderId || !receiverId || !content) return;

          // Block Check
          const sender = await User.findById(senderId);
          const receiver = await User.findById(receiverId);
          if (sender && receiver) {
            const isBlockedByReceiver = receiver.blockedUsers && receiver.blockedUsers.includes(senderId);
            const isBlockedBySender = sender.blockedUsers && sender.blockedUsers.includes(receiverId);
            if (isBlockedByReceiver || isBlockedBySender) {
              socket.emit('message_blocked', { message: 'Message blocked: You have blocked this user or been blocked by them.' });
              return;
            }
          }

          const savedMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content: content,
            messageType: messageType || 'text'
          });

          // Broadcast to receiver
          io.to(receiverId.toString()).emit('receive_direct_message', savedMessage);
          // Emit back to sender
          socket.emit('receive_direct_message', savedMessage);
        } catch (err) {
          console.error('Socket send_direct_message error:', err);
        }
      });

      // Mark messages as read
      socket.on('read_messages', async (data) => {
        try {
          const { senderId, receiverId } = data;
          if (!senderId || !receiverId) return;

          await Message.updateMany(
            { sender: senderId, receiver: receiverId, isRead: false },
            { $set: { isRead: true } }
          );

          io.to(senderId.toString()).emit('messages_read', { readerId: receiverId });
        } catch (err) {
          console.error('Socket read_messages error:', err);
        }
      });

      // Direct messaging typing indicator
      socket.on('direct_typing', (data) => {
        const { senderId, receiverId, isTyping } = data;
        if (receiverId) {
          socket.to(receiverId.toString()).emit('direct_typing', { senderId, isTyping });
        }
      });

      // Group messaging room join
      socket.on('join_group_room', (data) => {
        try {
          const { groupId } = data;
          if (groupId) {
            socket.join(groupId.toString());
            console.log(`Socket ${socket.id} joined group room ${groupId}`);
          }
        } catch (err) {
          console.error('Socket join_group_room error:', err);
        }
      });

      // Send group message
      socket.on('send_group_message', async (data) => {
        try {
          const { senderId, groupId, content, messageType } = data;
          if (!senderId || !groupId || !content) return;

          const savedMessage = await Message.create({
            sender: senderId,
            group: groupId,
            content: content,
            messageType: messageType || 'text'
          });

          const populatedMessage = await Message.findById(savedMessage._id)
            .populate('sender', 'name profilePic');

          // Broadcast to all group members in the room
          io.to(groupId.toString()).emit('receive_group_message', populatedMessage);
        } catch (err) {
          console.error('Socket send_group_message error:', err);
        }
      });

      // Group typing indicator
      socket.on('group_typing', (data) => {
        const { senderId, senderName, groupId, isTyping } = data;
        if (groupId) {
          socket.to(groupId.toString()).emit('group_typing', { senderId, senderName, groupId, isTyping });
        }
      });

      // calling sockets
      socket.on('call_user', async (data) => {
        const { callerId, callerName, receiverId, type } = data;
        if (receiverId) {
          try {
            const receiver = await User.findById(receiverId);
            if (receiver && receiver.blockedUsers && receiver.blockedUsers.includes(callerId)) {
              socket.emit('call_blocked', { message: 'Call blocked: You have blocked this user or been blocked by them.' });
              return;
            }
          } catch (err) {
            console.error('Call block check error:', err);
          }
          io.to(receiverId.toString()).emit('incoming_call', { callerId, callerName, type });
        }
      });

      socket.on('decline_call', (data) => {
        const { callerId } = data;
        if (callerId) {
          io.to(callerId.toString()).emit('call_declined');
        }
      });

      socket.on('accept_call', (data) => {
        const { callerId, receiverId } = data;
        if (callerId) {
          io.to(callerId.toString()).emit('call_accepted', { receiverId });
        }
      });

      socket.on('end_call', (data) => {
        const { targetId } = data;
        if (targetId) {
          io.to(targetId.toString()).emit('call_ended');
        }
      });

      socket.on('webrtc_signal', (data) => {
        const { targetId, senderId, signal } = data;
        if (targetId) {
          // Use senderId from data (reliable) or fallback to socket.userId
          const resolvedSenderId = senderId || socket.userId;
          io.to(targetId.toString()).emit('webrtc_signal', { senderId: resolvedSenderId, signal });
        }
      });

      socket.on('group_call', (data) => {
        const { callerId, callerName, groupId, type } = data;
        if (groupId) {
          socket.to(groupId.toString()).emit('incoming_group_call', { callerId, callerName, groupId, type });
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
        if (socket.userId) {
          activeUsers.delete(socket.userId);
          // Broadcast updated online list
          io.emit('online_users', Array.from(activeUsers));
        }
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
