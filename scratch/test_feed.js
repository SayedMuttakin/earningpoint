const mongoose = require('mongoose');
const Post = require('../backend/models/Post');
const User = require('../backend/models/User');

const MONGO_URI = "mongodb+srv://muttakinrhaman626:muttakinrhaman626@cluster0.wj6adsw.mongodb.net/Zenvio?appName=Cluster0";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    // Find any user to test
    const user = await User.findOne();
    if (!user) {
      console.log("No users found in database to test.");
      process.exit(0);
    }
    console.log(`Testing with user: ${user.name} (${user._id})`);
    console.log(`Following list:`, user.following);

    const currentUserId = user._id;
    const followingIds = user.following || [];

    // Query 1
    console.log("Querying followed posts...");
    const followedPosts = await Post.find({
      authorId: { $in: [...followingIds, currentUserId] }
    }).sort({ createdAt: -1 }).limit(30);
    console.log(`Found ${followedPosts.length} followed posts.`);

    // Query 2
    console.log("Querying non-followed posts...");
    const nonFollowedPosts = await Post.find({
      authorId: { $nin: [...followingIds, currentUserId, null] }
    }).sort({ createdAt: -1 }).limit(15);
    console.log(`Found ${nonFollowedPosts.length} non-followed posts.`);

    // Combine & Sort
    console.log("Combining and mapping...");
    const feedPosts = [...followedPosts, ...nonFollowedPosts];
    feedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const postsWithStatus = feedPosts.map(post => {
      const isFollowing = post.authorId ? followingIds.map(id => id.toString()).includes(post.authorId.toString()) : false;
      const isOwnPost = post.authorId ? post.authorId.toString() === currentUserId.toString() : false;
      return {
        ...post.toObject(),
        isFollowing,
        isOwnPost
      };
    });
    console.log("Success! Mapped posts count:", postsWithStatus.length);

  } catch (err) {
    console.error("CRITICAL ERROR IN QUERY EXECUTION:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
