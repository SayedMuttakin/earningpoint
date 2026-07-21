const Post = require('../models/Post');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Get all posts (Public)
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const query = {};
    if (req.query.adminOnly === 'true') {
      query.authorId = null;
    }
    const posts = await Post.find(query)
      .populate('authorId', 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge')
      .sort({ createdAt: -1 })
      .limit(30)  // Limit to 30 most recent posts
      .lean();
    const mapped = posts.map(post => {
      const authorObj = post.authorId;
      return {
        ...post,
        authorId: authorObj ? authorObj._id.toString() : null,
        authorDetails: authorObj ? {
          name: authorObj.name,
          profilePic: authorObj.profilePic,
          googleAvatar: authorObj.googleAvatar,
          facebookAvatar: authorObj.facebookAvatar,
          isEmailVerified: authorObj.isEmailVerified,
          verificationBadge: authorObj.verificationBadge || 'none'
        } : null
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('authorId', 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const postObj = post.toObject();
    const authorObj = postObj.authorId;
    res.json({
      ...postObj,
      authorId: authorObj ? authorObj._id.toString() : null,
      authorDetails: authorObj ? {
        name: authorObj.name,
        profilePic: authorObj.profilePic,
        googleAvatar: authorObj.googleAvatar,
        facebookAvatar: authorObj.facebookAvatar,
        isEmailVerified: authorObj.isEmailVerified,
        verificationBadge: authorObj.verificationBadge || 'none'
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new post (Admin)
// @route   POST /api/admin/posts
// @access  Private/Admin
exports.createPost = async (req, res) => {
  try {
    const { content, title, image, video, authorName, isVerified, category, customTime, createdAt } = req.body;
    
    if (!content && !image && !video) {
      return res.status(400).json({ message: 'Content or media is required' });
    }

    const postData = {
      content,
      title: title || null,
      image: image || null,
      video: video || null,
      authorName: authorName || 'Zenivio',
      isVerified: isVerified !== undefined ? isVerified : true,
      category: category || 'General',
      customTime: customTime || null
    };

    if (createdAt) {
      postData.createdAt = new Date(createdAt);
    }

    const post = await Post.create(postData);

    // Notify all users about the new post
    try {
      const users = await User.find({}, '_id');
      const notificationPromises = users.map(user => 
        createNotification(
          user._id, 
          'New Post Updated! 📢', 
          `${authorName || 'Zenivio'} has shared a new update. Check it out now!`, 
          'post',
          post._id
        )
      );
      await Promise.all(notificationPromises);
    } catch (notifyError) {
      console.error('Error sending post notifications:', notifyError);
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a post (Admin)
// @route   PUT /api/admin/posts/:id
// @access  Private/Admin
exports.updatePost = async (req, res) => {
  try {
    const { content, title, image, video, authorName, isVerified, category, customTime, createdAt } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (content !== undefined) post.content = content;
    if (title !== undefined) post.title = title;
    if (image !== undefined) post.image = image;
    if (video !== undefined) post.video = video;
    if (authorName !== undefined) post.authorName = authorName;
    if (isVerified !== undefined) post.isVerified = isVerified;
    if (category !== undefined) post.category = category;
    if (customTime !== undefined) post.customTime = customTime;
    if (createdAt !== undefined && createdAt) post.createdAt = new Date(createdAt);

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a post (Admin)
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get custom home page feed for authenticated user (Followed posts + Recommended posts)
// @route   GET /api/posts/feed
// @access  Private
exports.getPostsFeed = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const followingIds = req.user.following || [];
    const savedPostsIds = req.user.savedPosts ? req.user.savedPosts.map(id => id.toString()) : [];

    const blockedUserIds = req.user.blockedUsers || [];

    // Fetch the 40 most recent community posts directly in a single fast indexed query
    const feedPosts = await Post.find({
      authorId: { $ne: null, $nin: blockedUserIds }, // Exclude admin updates and blocked users
      'reports.user': { $ne: currentUserId } // Exclude posts reported by the current user
    })
      .populate('authorId', 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge')
      .sort({ createdAt: -1 })
      .limit(40);
 
    // Map following and own post indicators in-memory
    const postsWithStatus = feedPosts.map(post => {
      const isFollowing = post.authorId ? followingIds.includes(post.authorId._id.toString()) : false;
      const isOwnPost = post.authorId ? post.authorId._id.toString() === currentUserId.toString() : false;
      const isSaved = savedPostsIds.includes(post._id.toString());
      
      const postObj = post.toObject();
      const authorObj = postObj.authorId;
      
      return {
        ...postObj,
        authorId: authorObj ? authorObj._id.toString() : null,
        authorDetails: authorObj ? {
          name: authorObj.name,
          profilePic: authorObj.profilePic,
          googleAvatar: authorObj.googleAvatar,
          facebookAvatar: authorObj.facebookAvatar,
          isEmailVerified: authorObj.isEmailVerified,
          verificationBadge: authorObj.verificationBadge || 'none'
        } : null,
        isFollowing,
        isOwnPost,
        isSaved
      };
    });

    res.json(postsWithStatus);
  } catch (error) {
    console.error('Error fetching posts feed:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new post by user
// @route   POST /api/posts
// @access  Private
exports.createUserPost = async (req, res) => {
  try {
    const { content, title, privacy, feeling, location, taggedFriends, bgGradient } = req.body;
    let imageUrl = null;
    let videoUrl = null;

    if (req.file) {
      const fileUrl = `/api/image?file=${req.file.filename}`;
      if (req.file.mimetype.startsWith('video/')) {
        videoUrl = fileUrl;
      } else {
        imageUrl = fileUrl;
      }
    }

    if (!content && !imageUrl && !videoUrl) {
      return res.status(400).json({ message: 'Content or media is required' });
    }

    let parsedFriends = [];
    if (taggedFriends) {
      try {
        parsedFriends = typeof taggedFriends === 'string' ? JSON.parse(taggedFriends) : taggedFriends;
      } catch (e) {
        parsedFriends = typeof taggedFriends === 'string' ? taggedFriends.split(',').map(f => f.trim()) : taggedFriends;
      }
    }

    const post = await Post.create({
      content,
      title: title || null,
      image: imageUrl,
      video: videoUrl,
      authorId: req.user._id,
      authorName: req.user.name || 'User',
      isVerified: req.user.isEmailVerified || false,
      privacy: privacy || 'public',
      feeling: feeling || null,
      location: location || null,
      taggedFriends: parsedFriends,
      bgGradient: bgGradient || null
    });

    const populatedPost = await Post.findById(post._id).populate('authorId', 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge');
    const postObj = populatedPost.toObject();
    const authorObj = postObj.authorId;
 
    res.status(201).json({
      ...postObj,
      authorId: authorObj ? authorObj._id.toString() : null,
      authorDetails: authorObj ? {
        name: authorObj.name,
        profilePic: authorObj.profilePic,
        googleAvatar: authorObj.googleAvatar,
        facebookAvatar: authorObj.facebookAvatar,
        isEmailVerified: authorObj.isEmailVerified,
        verificationBadge: authorObj.verificationBadge || 'none'
      } : null
    });
  } catch (error) {
    console.error('Error creating user post:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all video posts (reels)
// @route   GET /api/posts/videos
// @access  Public
exports.getVideoPosts = async (req, res) => {
  try {
    let blockedUserIds = [];
    let currentUserId = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          blockedUserIds = user.blockedUsers || [];
          currentUserId = user._id;
        }
      } catch (err) {
        // Ignore token validation issues for compatibility
      }
    }

    const query = { video: { $ne: null } };
    if (blockedUserIds.length > 0) {
      query.authorId = { $nin: blockedUserIds };
    }
    if (currentUserId) {
      query['reports.user'] = { $ne: currentUserId };
    }

    const posts = await Post.find(query)
      .populate('authorId', 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge')
      .sort({ createdAt: -1 })
      .limit(20)  // Limit to 20 most recent reels
      .lean();
    const mapped = posts.map(post => {
      const authorObj = post.authorId;
      return {
        ...post,
        authorId: authorObj ? authorObj._id.toString() : null,
        authorDetails: authorObj ? {
          _id: authorObj._id.toString(),
          name: authorObj.name,
          profilePic: authorObj.profilePic,
          googleAvatar: authorObj.googleAvatar,
          facebookAvatar: authorObj.facebookAvatar,
          isEmailVerified: authorObj.isEmailVerified,
          verificationBadge: authorObj.verificationBadge || 'none'
        } : null
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle like on a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
      // Trigger notification for post author (if not own post)
      if (post.authorId && post.authorId.toString() !== userId.toString()) {
        try {
          await createNotification(
            post.authorId,
            'New Like! ❤️',
            `${req.user.name || 'A user'} liked your post: "${post.content.substring(0, 30)}${post.content.length > 30 ? '...' : ''}"`,
            'post',
            post._id
          );
        } catch (err) {
          console.error('Failed to create like notification:', err);
        }
      }
    }

    await post.save();
    
    res.json({ 
      likesCount: post.likes.length, 
      isLiked: !isLiked 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
// @access  Private
exports.commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user._id,
      userName: req.user.name || 'User',
      userAvatar: req.user.profilePic || req.user.googleAvatar || req.user.facebookAvatar || '',
      text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Trigger notification for post author (if not own post)
    if (post.authorId && post.authorId.toString() !== req.user._id.toString()) {
      try {
        await createNotification(
          post.authorId,
          'New Comment! 💬',
          `${req.user.name || 'A user'} commented: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
          'post',
          post._id
        );
      } catch (err) {
        console.error('Failed to create comment notification:', err);
      }
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle save post
// @route   POST /api/posts/:id/save
// @access  Private
exports.toggleSavePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.savedPosts) {
      user.savedPosts = [];
    }

    const isSaved = user.savedPosts.includes(post._id);
    if (isSaved) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== post._id.toString());
    } else {
      user.savedPosts.push(post._id);
    }

    await user.save();
    res.json({ isSaved: !isSaved });
  } catch (error) {
    res.status(550).json({ message: error.message });
  }
};

// @desc    Get saved posts for authenticated user
// @route   GET /api/posts/saved
// @access  Private
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: 'savedPosts',
      populate: {
        path: 'authorId',
        select: 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Map populated saved posts
    const savedPosts = (user.savedPosts || [])
      .filter(post => post !== null)
      .map(post => {
        const postObj = post.toObject();
        const authorObj = postObj.authorId;
        
        return {
          ...postObj,
          authorId: authorObj ? authorObj._id.toString() : null,
          authorDetails: authorObj ? {
            name: authorObj.name,
            profilePic: authorObj.profilePic,
            googleAvatar: authorObj.googleAvatar,
            facebookAvatar: authorObj.facebookAvatar,
            isEmailVerified: authorObj.isEmailVerified,
            verificationBadge: authorObj.verificationBadge || 'none'
          } : null,
          isSaved: true
        };
      });

    res.json(savedPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/posts/:id — Delete a post (User-facing)
exports.deleteUserPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if current user is the author
    if (post.authorId && post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a post by user
// @route   PUT /api/posts/:id
// @access  Private
exports.updateUserPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if current user is the author
    if (post.authorId && post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to edit this post' });
    }

    const { content, title, privacy, feeling, location, taggedFriends, bgGradient } = req.body;

    let imageUrl = post.image;
    let videoUrl = post.video;

    if (req.file) {
      const fileUrl = `/api/image?file=${req.file.filename}`;
      if (req.file.mimetype.startsWith('video/')) {
        videoUrl = fileUrl;
        imageUrl = null; // Clear image if new video uploaded
      } else {
        imageUrl = fileUrl;
        videoUrl = null; // Clear video if new image uploaded
      }
    }

    // Also support clearing media
    if (req.body.clearImage === 'true') {
      imageUrl = null;
    }
    if (req.body.clearVideo === 'true') {
      videoUrl = null;
    }

    if (!content && !imageUrl && !videoUrl) {
      return res.status(400).json({ message: 'Content or media is required' });
    }

    let parsedFriends = post.taggedFriends;
    if (taggedFriends) {
      try {
        parsedFriends = typeof taggedFriends === 'string' ? JSON.parse(taggedFriends) : taggedFriends;
      } catch (e) {
        parsedFriends = typeof taggedFriends === 'string' ? taggedFriends.split(',').map(f => f.trim()) : taggedFriends;
      }
    }

    post.content = content;
    post.title = title || null;
    post.image = imageUrl;
    post.video = videoUrl;
    post.privacy = privacy || 'public';
    post.feeling = feeling || null;
    post.location = location || null;
    post.taggedFriends = parsedFriends;
    post.bgGradient = bgGradient || null;

    await post.save();

    const populatedPost = await Post.findById(post._id).populate('authorId', 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge');
    const postObj = populatedPost.toObject();
    const authorObj = postObj.authorId;

    res.json({
      ...postObj,
      authorId: authorObj ? authorObj._id.toString() : null,
      authorDetails: authorObj ? {
        name: authorObj.name,
        profilePic: authorObj.profilePic,
        googleAvatar: authorObj.googleAvatar,
        facebookAvatar: authorObj.facebookAvatar,
        isEmailVerified: authorObj.isEmailVerified,
        verificationBadge: authorObj.verificationBadge || 'none'
      } : null
    });
  } catch (error) {
    console.error('Error updating user post:', error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/posts/:id/report — Report a post (UGC Content Moderation)
exports.reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { reason } = req.body;
    const userId = req.user._id;

    // Check if already reported
    const alreadyReported = post.reports && post.reports.some(r => r.user.toString() === userId.toString());
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this post.' });
    }

    if (!post.reports) post.reports = [];
    post.reports.push({
      user: userId,
      reason: reason || 'Inappropriate Content'
    });

    await post.save();

    // Log the report in the Admin Notifications list
    const AdminNotification = require('../models/AdminNotification');
    await AdminNotification.create({
      title: 'Post Reported ⚠️',
      message: `Post by ${post.authorName} was reported by user ID ${userId}. Reason: ${reason || 'Inappropriate content'}`,
      type: 'support',
      referenceId: post._id.toString()
    });

    res.json({ message: 'Post reported successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/posts/:postId/comment/:commentId — Delete a comment (User-facing)
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId.toString());
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = post.comments[commentIndex];

    // Check authorization: must be comment owner or post owner
    const isCommentAuthor = comment.user && comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post.authorId && post.authorId.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    res.json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

