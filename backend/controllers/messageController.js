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

    const users = await User.find({ 
      _id: { $in: relatedUserIds, $ne: currentUserId } 
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
