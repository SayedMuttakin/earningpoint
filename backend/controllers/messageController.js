const User = require('../models/User');
const Message = require('../models/Message');
const Group = require('../models/Group');

// Fetch all direct chat users and groups consolidated, sorted by last message time
exports.getUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);
    const followingIds = currentUser.following || [];

    // 1. Fetch Direct Users (only followed users or those with chat history)
    const messagedUserIds = await Message.distinct('sender', { receiver: currentUserId, group: { $exists: false } });
    const receivedUserIds = await Message.distinct('receiver', { sender: currentUserId, group: { $exists: false } });
    const relatedUserIds = [...new Set([
      ...followingIds.map(id => id.toString()),
      ...messagedUserIds.map(id => id.toString()),
      ...receivedUserIds.map(id => id.toString())
    ])];

    // Filter out blocked users (users we blocked OR users who blocked us)
    const blockedUserIds = currentUser.blockedUsers || [];
    const usersWhoBlockedMe = await User.find({ blockedUsers: currentUserId }, '_id');
    const blockedMeIds = usersWhoBlockedMe.map(u => u._id.toString());
    const excludeIds = [...new Set([...blockedUserIds.map(id => id.toString()), ...blockedMeIds])];

    const users = await User.find({ 
      _id: { $in: relatedUserIds, $ne: currentUserId, $nin: excludeIds } 
    }).select('name phoneOrEmail profilePic isPremium');

    const directChats = await Promise.all(users.map(async (u) => {
      const lastMsg = await Message.findOne({
        sender: { $in: [currentUserId, u._id] },
        receiver: { $in: [currentUserId, u._id] },
        group: { $exists: false }
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        sender: u._id,
        receiver: currentUserId,
        isRead: false
      });

      return {
        _id: u._id,
        isGroup: false,
        name: u.name || u.phoneOrEmail || 'User',
        phoneOrEmail: u.phoneOrEmail || '',
        profilePic: u.profilePic || '',
        isPremium: u.isPremium || false,
        lastMessage: lastMsg ? lastMsg.content : '',
        lastMessageTime: lastMsg ? lastMsg.createdAt : null,
        lastMessageSender: lastMsg ? lastMsg.sender : null,
        isFollowing: followingIds.includes(u._id.toString()),
        unreadCount
      };
    }));

    // 2. Fetch Group Chats where user is a member
    const groups = await Group.find({ members: currentUserId });
    const groupChats = await Promise.all(groups.map(async (g) => {
      const lastMsg = await Message.findOne({ group: g._id })
        .sort({ createdAt: -1 })
        .populate('sender', 'name');

      const unreadCount = await Message.countDocuments({
        group: g._id,
        sender: { $ne: currentUserId },
        isRead: false
      });

      let lastMsgText = '';
      if (lastMsg) {
        const senderName = lastMsg.sender ? (lastMsg.sender.name || 'User') : 'User';
        lastMsgText = `${senderName}: ${lastMsg.content}`;
      }

      return {
        _id: g._id,
        isGroup: true,
        name: g.name,
        profilePic: g.profilePic || '',
        lastMessage: lastMsgText,
        lastMessageTime: lastMsg ? lastMsg.createdAt : null,
        lastMessageSender: lastMsg ? lastMsg.sender?._id : null,
        unreadCount
      };
    }));

    // 3. Consolidate and Sort by last message time
    const allChats = [...directChats, ...groupChats];
    allChats.sort((a, b) => {
      if (a.lastMessageTime && b.lastMessageTime) {
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      }
      if (a.lastMessageTime) return -1;
      if (b.lastMessageTime) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json(allChats);
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
      ],
      group: { $exists: false }
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

// Create a new group chat
exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const currentUserId = req.user._id;

    if (!name || !members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Group name and members are required' });
    }

    // Ensure creator is included in the members list
    const memberIds = [...new Set([...members, currentUserId.toString()])];

    const group = await Group.create({
      name,
      members: memberIds,
      createdBy: currentUserId,
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetch group message history
exports.getGroupHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const groupId = req.params.groupId;

    const messages = await Message.find({ group: groupId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profilePic');

    // Mark group messages as read for this user
    await Message.updateMany(
      { group: groupId, sender: { $ne: currentUserId }, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching group history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update status note (24-hour expiration note)
exports.updateNote = async (req, res) => {
  try {
    const { note } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        note: note || '',
        noteCreatedAt: note ? new Date() : null,
      },
      { new: true }
    );

    res.json({ note: user.note, noteCreatedAt: user.noteCreatedAt });
  } catch (error) {
    console.error('Error updating status note:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get status notes of active users within 24 hours (only followed users, chat history, or yourself)
exports.getNotes = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);
    const followingIds = currentUser.following || [];

    const messagedUserIds = await Message.distinct('sender', { receiver: currentUserId, group: { $exists: false } });
    const receivedUserIds = await Message.distinct('receiver', { sender: currentUserId, group: { $exists: false } });
    const relatedUserIds = [...new Set([
      ...followingIds.map(id => id.toString()),
      ...messagedUserIds.map(id => id.toString()),
      ...receivedUserIds.map(id => id.toString())
    ])];

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const users = await User.find({
      _id: { $in: [...relatedUserIds, currentUserId.toString()] },
      note: { $ne: '' },
      noteCreatedAt: { $gte: twentyFourHoursAgo }
    }).select('name profilePic note noteCreatedAt');

    res.json(users);
  } catch (error) {
    console.error('Error fetching active notes:', error);
    res.status(555).json({ message: 'Internal server error' });
  }
};

// Upload a file (image/audio) for a message
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return the filename so the frontend can save it and access via /api/image?file=filename
    res.json({ filename: req.file.filename });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── STORY FUNCTIONS ──────────────────────────────────────────────

// Add a new story (expires in 24 hours, max 10 per user)
exports.addStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text, emoji, bgGradient, textColor, fontStyle } = req.body;
    const imageFilename = req.file ? req.file.filename : '';

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Remove expired stories
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { stories: { createdAt: { $lt: twentyFourHoursAgo } } } },
      { new: true }
    );

    // Max 10 active stories per user
    if (user.stories.length >= 10) {
      return res.status(400).json({ message: 'Maximum 10 stories allowed at once' });
    }

    // Push new story
    user.stories.push({
      text: text || '',
      emoji: emoji || '',
      image: imageFilename,
      bgGradient: bgGradient || 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
      textColor: textColor || '#ffffff',
      fontStyle: fontStyle || 'normal',
      createdAt: new Date()
    });
    await user.save();

    const newStory = user.stories[user.stories.length - 1];
    res.status(201).json(newStory);
  } catch (error) {
    console.error('Error adding story:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a specific story by ID
exports.deleteStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const storyId = req.params.storyId;

    await User.findByIdAndUpdate(userId, {
      $pull: { stories: { _id: storyId } }
    });

    res.json({ message: 'Story deleted' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all active (24h) stories from following/chat users + yourself
exports.getStories = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);
    const followingIds = currentUser.following || [];

    const messagedUserIds = await Message.distinct('sender', { receiver: currentUserId, group: { $exists: false } });
    const receivedUserIds = await Message.distinct('receiver', { sender: currentUserId, group: { $exists: false } });
    const relatedUserIds = [...new Set([
      currentUserId.toString(),
      ...followingIds.map(id => id.toString()),
      ...messagedUserIds.map(id => id.toString()),
      ...receivedUserIds.map(id => id.toString())
    ])];

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const users = await User.find({
      _id: { $in: relatedUserIds },
      'stories.0': { $exists: true }
    }).select('name profilePic stories');

    // Filter expired stories and users with no active stories
    const result = users.map(u => {
      const activeStories = u.stories.filter(s => new Date(s.createdAt) >= twentyFourHoursAgo);
      return {
        _id: u._id,
        name: u.name,
        profilePic: u.profilePic,
        stories: activeStories
      };
    }).filter(u => u.stories.length > 0);

    res.json(result);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/messages/chat/:otherUserId — Delete chat history with a user (User-facing)
exports.deleteChatHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.otherUserId;

    const result = await Message.deleteMany({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ],
      group: { $exists: false }
    });

    res.json({ message: 'Chat history deleted successfully.', count: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/messages/report/:messageId — Report a specific chat message
exports.reportMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const { reason } = req.body;

    const AdminNotification = require('../models/AdminNotification');
    await AdminNotification.create({
      title: 'Message Reported 💬',
      message: `Message reported by user ID ${req.user._id}. Reason: ${reason || 'Inappropriate Content'}. Message content: "${message.content.substring(0, 100)}"`,
      type: 'support',
      referenceId: message._id.toString()
    });

    res.json({ message: 'Message reported successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
