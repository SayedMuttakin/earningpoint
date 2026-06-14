const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');

const MONGO_URI = "mongodb+srv://muttakinrhaman626:muttakinrhaman626@cluster0.wj6adsw.mongodb.net/Zenvio?appName=Cluster0";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    const countAll = await Post.countDocuments();
    const countUserPosts = await Post.countDocuments({ authorId: { $ne: null } });
    console.log(`Total posts in DB: ${countAll}, User posts in DB: ${countUserPosts}`);

    const feedPosts = await Post.find({
      authorId: { $ne: null }
    })
      .populate('authorId', 'name profilePic googleAvatar isEmailVerified')
      .sort({ createdAt: -1 })
      .limit(40);

    console.log(`Found ${feedPosts.length} posts for the feed.`);
    if (feedPosts.length > 0) {
      console.log("First post author ID object:", feedPosts[0].authorId);
      console.log("First post content sample:", feedPosts[0].content || feedPosts[0].title);
    }
  } catch (err) {
    console.error("CRITICAL ERROR IN QUERY EXECUTION:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
