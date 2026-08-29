const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId).select('following');
    const followingIds = (currentUser?.following || []).map(id => id.toString());

    const notifications = await Notification.find({ userId: currentUserId })
      .populate('senderId', 'name username profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge')
      .populate('postId', 'content image')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const mappedNotifications = notifications.map(n => {
      const s = n.senderId;
      let senderObj = null;
      if (s && typeof s === 'object') {
        const sId = s._id ? s._id.toString() : '';
        const isFollowing = followingIds.includes(sId);
        senderObj = {
          _id: sId,
          name: s.name,
          username: s.username || '',
          profilePic: s.profilePic || s.googleAvatar || s.facebookAvatar || '',
          isEmailVerified: Boolean(s.isEmailVerified),
          verificationBadge: s.verificationBadge || (s.isEmailVerified ? 'blue' : 'none'),
          isFollowing
        };
      }
      return {
        ...n,
        senderId: s && typeof s === 'object' ? s._id.toString() : (s ? s.toString() : null),
        sender: senderObj
      };
    });

    res.json(mappedNotifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user._id, 
      isRead: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper for other controllers to create notifications
exports.createNotification = async (userId, title, message, type = 'system', postId = null, senderId = null) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      postId,
      senderId
    });

    if (global.io) {
      global.io.to(userId.toString()).emit('new_notification', {
        _id: notification._id,
        userId,
        title,
        message,
        type,
        postId,
        senderId,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
