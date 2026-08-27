const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /api/profile — Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const Post = require('../models/Post');

    // Fetch user and post count in parallel — saves one round-trip
    const [user, postsCount] = await Promise.all([
      User.findById(req.user._id).select('-password').lean(),
      Post.countDocuments({ authorId: req.user._id })
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profileData = {
      ...user,
      postsCount,
      followersCount: user.followers ? user.followers.length : 0,
      followingCount: user.following ? user.following.length : 0
    };

    res.json(profileData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// PUT /api/profile — Update profile info (name, location, bio, profilePic, coverPic, website, highlights)
exports.updateProfile = async (req, res) => {
  try {
    const { name, location, bio, profilePic, coverPic, website, highlights, dob, gender, dobPrivacy, genderPrivacy } = req.body;
    const user = await User.findById(req.user._id);
 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
 
    const Post = require('../models/Post');
 
    if (name !== undefined) user.name = name;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    if (highlights !== undefined) user.highlights = highlights;
    if (dob !== undefined) user.dob = dob;
    if (gender !== undefined) user.gender = gender;
    if (dobPrivacy !== undefined) user.dobPrivacy = dobPrivacy;
    if (genderPrivacy !== undefined) user.genderPrivacy = genderPrivacy;
    if (req.body.hideFollowersList !== undefined) user.hideFollowersList = req.body.hideFollowersList;

    const { saveBase64AsWebp } = require('../utils/imageOptimizer');

    if (profilePic !== undefined && profilePic !== user.profilePic) {
      let savedProfilePic = profilePic;
      if (typeof profilePic === 'string' && profilePic.startsWith('data:image/')) {
        savedProfilePic = await saveBase64AsWebp(profilePic, `avatar-${user._id}`, 1080, 1080, 92);
      }
      user.profilePic = savedProfilePic;

      // Automatically generate a timeline post
      const newPost = new Post({
        content: `updated their profile picture.`,
        image: savedProfilePic,
        authorId: user._id,
        authorName: user.name || 'User',
        isVerified: user.isEmailVerified || false
      });
      await newPost.save();
    }

    if (coverPic !== undefined && coverPic !== user.coverPic) {
      let savedCoverPic = coverPic;
      if (typeof coverPic === 'string' && coverPic.startsWith('data:image/')) {
        savedCoverPic = await saveBase64AsWebp(coverPic, `cover-${user._id}`, 1920, 1080, 92);
      }
      user.coverPic = savedCoverPic;

      // Automatically generate a timeline post
      const newPost = new Post({
        content: `updated their cover photo.`,
        image: savedCoverPic,
        authorId: user._id,
        authorName: user.name || 'User',
        isVerified: user.isEmailVerified || false
      });
      await newPost.save();
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// PUT /api/profile/password — Change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide old and new passwords' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// DELETE /api/profile — Delete account (requires password confirmation)
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Please provide your password to confirm deletion' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// PUT /api/profile/darkmode — Toggle dark mode
exports.toggleDarkMode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.darkMode = !user.darkMode;
    await user.save();

    res.json({ darkMode: user.darkMode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// POST /api/profile/follow/:userId — Follow or Unfollow a user
exports.followUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User to follow not found' });
    }

    // Initialize arrays if they don't exist
    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString());
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
      await currentUser.save();
      await targetUser.save();
      return res.json({ isFollowing: false, message: 'Unfollowed user successfully' });
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      await currentUser.save();
      await targetUser.save();

      try {
        const { createNotification } = require('./notificationController');
        createNotification(
          targetUserId,
          'New Follower! 👤',
          `${currentUser.name || 'A user'} started following you.`,
          'follow',
          null,
          currentUserId
        );
      } catch (e) {
        console.error('Failed to create follow notification:', e);
      }

      return res.json({ isFollowing: true, message: 'Followed user successfully' });
    }
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/profile/search — Search users by name or phone/email
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const currentUserId = req.user._id;
    const followingIds = req.user.following || [];

    const mongoose = require('mongoose');
    const isObjectId = mongoose.Types.ObjectId.isValid(q.trim());

    const orConditions = [
      { name: { $regex: q, $options: 'i' } },
      { phoneOrEmail: { $regex: q, $options: 'i' } },
      { referralCode: { $regex: q, $options: 'i' } },
      { username: { $regex: q, $options: 'i' } }
    ];

    if (isObjectId) {
      orConditions.push({ _id: q.trim() });
    }

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: orConditions
    })
    .select('name username referralCode phoneOrEmail profilePic isPremium')
    .limit(20);

    const mappedUsers = users.map(u => {
      const isFollowing = followingIds.includes(u._id.toString());
      const displayUsername = u.username || (u.referralCode ? u.referralCode.toLowerCase() : (u.phoneOrEmail ? (u.phoneOrEmail.includes('@') ? u.phoneOrEmail.split('@')[0] : u.phoneOrEmail) : 'user'));
      return {
        _id: u._id,
        name: u.name || displayUsername || 'User',
        username: displayUsername,
        phoneOrEmail: u.phoneOrEmail || '',
        profilePic: u.profilePic || '',
        isPremium: u.isPremium || false,
        isFollowing
      };
    });

    res.json(mappedUsers);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get public profile of another user
// @route   GET /api/profile/:userId
// @access  Private
exports.getPublicProfile = async (req, res) => {
  try {
    let targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    if (targetUserId === 'me') {
      targetUserId = currentUserId;
    }

    const Post = require('../models/Post');

    // Fetch user + posts in parallel with field projections for maximum performance
    const [user, posts] = await Promise.all([
      User.findById(targetUserId)
        .select('name username referralCode phoneOrEmail profilePic coverPic googleAvatar facebookAvatar isEmailVerified verificationBadge followers following bio location website highlights dob gender dobPrivacy genderPrivacy')
        .lean(),
      Post.find({ authorId: targetUserId })
        .select('_id content title image video createdAt likes comments')
        .sort({ createdAt: -1 })
        .limit(40)  // Paginate — load first 40 posts only
        .lean()
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate total likes on their posts
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);

    // Split into videos (reels) and text/image posts
    const videos = posts.filter(p => p.video);
    const communityPosts = posts.filter(p => !p.video);

    // Is the current user following this target user?
    const isFollowing = user.followers ? user.followers.some(id => id.toString() === currentUserId.toString()) : false;
    const isOwnProfile = targetUserId.toString() === currentUserId.toString();

    const showDob = isOwnProfile || user.dobPrivacy === 'public';
    const showGender = isOwnProfile || user.genderPrivacy === 'public';

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username || (user.referralCode ? user.referralCode.toLowerCase() : (user.phoneOrEmail ? (user.phoneOrEmail.includes('@') ? user.phoneOrEmail.split('@')[0] : user.phoneOrEmail) : 'user')),
        profilePic: user.profilePic,
        coverPic: user.coverPic || '',
        googleAvatar: user.googleAvatar,
        facebookAvatar: user.facebookAvatar,
        isEmailVerified: user.isEmailVerified,
        verificationBadge: user.verificationBadge || 'none',
        followersCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0,
        totalLikes,
        bio: user.bio || 'Follow and support me!',
        location: user.location || '',
        website: user.website || '',
        highlights: user.highlights || [],
        isFollowing,
        isBlocked: req.user.blockedUsers ? req.user.blockedUsers.includes(user._id) : false,
        dob: showDob ? (user.dob || '') : '',
        gender: showGender ? (user.gender || '') : '',
        dobPrivacy: user.dobPrivacy || 'public',
        genderPrivacy: user.genderPrivacy || 'public'
      },
      videos: videos.map(v => ({
        _id: v._id,
        video: v.video,
        image: v.image,
        title: v.title,
        content: v.content,
        views: v.likes ? v.likes.length * 2 + 5 : 365,
        likesCount: v.likes?.length || 0,
        commentsCount: v.comments?.length || 0
      })),
      posts: communityPosts.map(p => ({
        _id: p._id,
        content: p.content,
        image: p.image,
        title: p.title,
        createdAt: p.createdAt,
        likesCount: p.likes?.length || 0,
        commentsCount: p.comments?.length || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/profile/block/:userId — Block or Unblock a user
exports.blockUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!currentUser.blockedUsers) currentUser.blockedUsers = [];
    const isBlocked = currentUser.blockedUsers.includes(targetUserId);

    if (isBlocked) {
      currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== targetUserId.toString());
      await currentUser.save();
      return res.json({ isBlocked: false, message: 'User unblocked successfully' });
    } else {
      currentUser.blockedUsers.push(targetUserId);
      
      // Auto-unfollow on block
      if (currentUser.following) {
        currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString());
      }
      if (currentUser.followers) {
        currentUser.followers = currentUser.followers.filter(id => id.toString() !== targetUserId.toString());
      }
      if (targetUser.following) {
        targetUser.following = targetUser.following.filter(id => id.toString() !== currentUserId.toString());
      }
      if (targetUser.followers) {
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
      }
      
      await currentUser.save();
      await targetUser.save();
      return res.json({ isBlocked: true, message: 'User blocked successfully' });
    }
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST /api/profile/report/:userId — Report a user
exports.reportUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;
    const { reason } = req.body;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser.blockedUsers) currentUser.blockedUsers = [];
    if (!currentUser.blockedUsers.includes(targetUserId)) {
      currentUser.blockedUsers.push(targetUserId);
      await currentUser.save();
    }

    // Log the report in the Admin Notifications list
    const AdminNotification = require('../models/AdminNotification');
    await AdminNotification.create({
      title: 'User Reported 🚨',
      message: `User ${currentUser.name || currentUser.phoneOrEmail} reported User ${targetUser.name || targetUser.phoneOrEmail}. Reason: ${reason || 'Inappropriate behavior/content'}`,
      type: 'support',
      referenceId: targetUserId.toString()
    });

    res.json({ message: 'User reported and blocked successfully.' });
  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/profile/blocked — Fetch populated list of blocked users
exports.getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('blockedUsers', 'name phoneOrEmail profilePic');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.blockedUsers || []);
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/profile/:userId/followers — Get list of followers for a user
exports.getFollowersList = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findById(userId).populate('followers', 'name username profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge phoneOrEmail');

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUserId = req.user._id.toString();

    // Privacy check: If user enabled hideFollowersList and requester is not targetUser
    if (targetUser.hideFollowersList && currentUserId !== targetUser._id.toString()) {
      return res.status(403).json({ isPrivate: true, message: "This user's followers/following list is private." });
    }

    const currentUserFollowing = (req.user.following || []).map(id => id.toString());

    // Slice and reverse so latest followers appear first (sobar age)
    const followersList = (targetUser.followers || []).slice().reverse().map(u => ({
      _id: u._id,
      name: u.name,
      username: u.username || 'user',
      profilePic: u.profilePic || u.googleAvatar || u.facebookAvatar || '',
      isEmailVerified: u.isEmailVerified,
      verificationBadge: u.verificationBadge,
      phoneOrEmail: u.phoneOrEmail,
      isFollowing: currentUserFollowing.includes(u._id.toString()),
      isSelf: u._id.toString() === currentUserId
    }));

    res.json(followersList);
  } catch (error) {
    console.error('Error fetching followers list:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/profile/:userId/following — Get list of users followed by a user
exports.getFollowingList = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findById(userId).populate('following', 'name username profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge phoneOrEmail');

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUserId = req.user._id.toString();

    // Privacy check: If user enabled hideFollowersList and requester is not targetUser
    if (targetUser.hideFollowersList && currentUserId !== targetUser._id.toString()) {
      return res.status(403).json({ isPrivate: true, message: "This user's followers/following list is private." });
    }

    const currentUserFollowing = (req.user.following || []).map(id => id.toString());

    // Slice and reverse so latest followings appear first (sobar age)
    const followingList = (targetUser.following || []).slice().reverse().map(u => ({
      _id: u._id,
      name: u.name,
      username: u.username || 'user',
      profilePic: u.profilePic || u.googleAvatar || u.facebookAvatar || '',
      isEmailVerified: u.isEmailVerified,
      verificationBadge: u.verificationBadge,
      phoneOrEmail: u.phoneOrEmail,
      isFollowing: currentUserFollowing.includes(u._id.toString()),
      isSelf: u._id.toString() === currentUserId
    }));

    res.json(followingList);
  } catch (error) {
    console.error('Error fetching following list:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/profile/suggestions — Get personalized suggested users to follow
exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId).select('following blockedUsers location');
    const followingIds = (currentUser?.following || []).map(id => id.toString());
    const blockedIds = (currentUser?.blockedUsers || []).map(id => id.toString());
    const excludeIds = [currentUserId.toString(), ...followingIds, ...blockedIds];

    const suggested = await User.find({
      _id: { $nin: excludeIds },
      isBanned: false
    })
    .select('name username profilePic googleAvatar facebookAvatar verificationBadge isEmailVerified location bio')
    .limit(12)
    .lean();

    const formatted = suggested.map(u => ({
      _id: u._id,
      name: u.name || 'Zenivio Member',
      username: u.username || 'user',
      profilePic: u.profilePic || u.googleAvatar || u.facebookAvatar || '',
      verificationBadge: u.verificationBadge || 'none',
      isEmailVerified: !!u.isEmailVerified,
      location: u.location || '',
      bio: u.bio || '',
      isFollowing: false
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


