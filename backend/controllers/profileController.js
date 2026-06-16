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

    if (profilePic !== undefined && profilePic !== user.profilePic) {
      user.profilePic = profilePic;
      // Automatically generate a timeline post
      const newPost = new Post({
        content: `updated their profile picture.`,
        image: profilePic,
        authorId: user._id,
        authorName: user.name || 'User',
        isVerified: user.isEmailVerified || false
      });
      await newPost.save();
    }

    if (coverPic !== undefined && coverPic !== user.coverPic) {
      user.coverPic = coverPic;
      // Automatically generate a timeline post
      const newPost = new Post({
        content: `updated their cover photo.`,
        image: coverPic,
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

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phoneOrEmail: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name phoneOrEmail profilePic isPremium')
    .limit(20);

    const mappedUsers = users.map(u => {
      const isFollowing = followingIds.includes(u._id.toString());
      return {
        _id: u._id,
        name: u.name || u.phoneOrEmail || 'User',
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

    // Fetch user + posts in parallel
    const [user, posts] = await Promise.all([
      User.findById(targetUserId)
        .select('name email profilePic coverPic googleAvatar isEmailVerified verificationBadge followers following bio location website highlights dob gender dobPrivacy genderPrivacy')
        .lean(),
      Post.find({ authorId: targetUserId })
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
        username: user.email ? user.email.split('@')[0] : 'user',
        profilePic: user.profilePic,
        coverPic: user.coverPic || '',
        googleAvatar: user.googleAvatar,
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
        commentsCount: p.comments?.length || 0,
        likes: p.likes,
        comments: p.comments
      }))
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ message: error.message });
  }
};

