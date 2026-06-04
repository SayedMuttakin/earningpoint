const User = require('../models/User');
const Message = require('../models/Message');

// Fetch all other users, sorted by last message time
exports.getUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);
    const followingIds = currentUser.following || [];
    
    // Fetch all users except current user
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('name phoneOrEmail profilePic isPremium');

    const usersWithLastMsg = await Promise.all(users.map(async (u) => {
      const lastMsg = await Message.findOne({
        $or: [
          { sender: currentUserId, receiver: u._id },
          { sender: u._id, receiver: currentUserId }
        ]
      }).sort({ createdAt: -1 });

      return {
        _id: u._id,
        name: u.name || u.phoneOrEmail || 'User',
        phoneOrEmail: u.phoneOrEmail || '',
        profilePic: u.profilePic || '',
        isPremium: u.isPremium || false,
        lastMessage: lastMsg ? lastMsg.content : '',
        lastMessageTime: lastMsg ? lastMsg.createdAt : null,
        lastMessageSender: lastMsg ? lastMsg.sender : null,
        isFollowing: followingIds.includes(u._id.toString())
      };
    }));

    // Sort: chats with messages first (by date desc), then others alphabetically
    usersWithLastMsg.sort((a, b) => {
      if (a.lastMessageTime && b.lastMessageTime) {
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      }
      if (a.lastMessageTime) return -1;
      if (b.lastMessageTime) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json(usersWithLastMsg);
  } catch (error) {
    console.error('Error fetching chat users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetch private message history with another user
exports.getChatHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.otherUserId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages received from this user as read
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
