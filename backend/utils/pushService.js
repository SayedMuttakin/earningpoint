const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

let isFirebaseInitialized = false;

// Initialize Firebase Admin SDK
try {
  const serviceAccountPath = path.join(__dirname, '../config/firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isFirebaseInitialized = true;
    console.log('✅ [Firebase Push] Firebase Admin initialized from service account JSON');
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isFirebaseInitialized = true;
    console.log('✅ [Firebase Push] Firebase Admin initialized from env variable');
  } else {
    console.log('ℹ️ [Firebase Push] Firebase Service Account not found yet. Push notifications will activate once backend/config/firebase-service-account.json is provided.');
  }
} catch (error) {
  console.error('⚠️ [Firebase Push] Failed to initialize Firebase Admin:', error.message);
}

/**
 * Send push notification to a specific list of FCM tokens
 */
async function sendPushToTokens(tokens, { title, body, data = {} }) {
  if (!isFirebaseInitialized || !tokens || tokens.length === 0) return;

  const validTokens = [...new Set(tokens.filter(t => typeof t === 'string' && t.trim().length > 10))];
  if (validTokens.length === 0) return;

  // Convert all data values to strings (FCM requirement)
  const stringifiedData = {};
  for (const [key, val] of Object.entries(data)) {
    stringifiedData[key] = typeof val === 'string' ? val : JSON.stringify(val);
  }

  const message = {
    tokens: validTokens,
    notification: {
      title: title || 'Zenivio',
      body: body || 'You have a new update'
    },
    data: stringifiedData,
    android: {
      priority: 'high',
      notification: {
        channelId: 'zenivio_chat_v3',
        sound: 'notification',
        defaultSound: false,
        priority: 'high',
        visibility: 'public',
        icon: 'ic_launcher'
      }
    }
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    
    // Clean up dead/unregistered tokens if any failed
    if (response.failureCount > 0) {
      const deadTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            deadTokens.push(validTokens[idx]);
          }
        }
      });

      if (deadTokens.length > 0) {
        await User.updateMany(
          { 'fcmTokens.token': { $in: deadTokens } },
          { $pull: { fcmTokens: { token: { $in: deadTokens } } } }
        );
      }
    }
  } catch (err) {
    console.error('[Firebase Push] Multicast send error:', err.message);
  }
}

/**
 * Send push notification to a single user by User ID
 */
async function sendPushToUser(userId, { title, body, data = {} }) {
  if (!isFirebaseInitialized || !userId) return;

  try {
    const user = await User.findById(userId).select('fcmTokens');
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) return;

    const tokens = user.fcmTokens.map(t => t.token);
    await sendPushToTokens(tokens, { title, body, data });
  } catch (err) {
    console.error('[Firebase Push] Error sending push to user:', err.message);
  }
}

/**
 * Send push notification to multiple users by User IDs
 */
async function sendPushToUsers(userIds, { title, body, data = {} }) {
  if (!isFirebaseInitialized || !userIds || userIds.length === 0) return;

  try {
    const users = await User.find({ _id: { $in: userIds } }).select('fcmTokens');
    const allTokens = [];
    users.forEach(u => {
      if (u.fcmTokens && u.fcmTokens.length > 0) {
        u.fcmTokens.forEach(t => allTokens.push(t.token));
      }
    });

    if (allTokens.length > 0) {
      await sendPushToTokens(allTokens, { title, body, data });
    }
  } catch (err) {
    console.error('[Firebase Push] Error sending push to users:', err.message);
  }
}

module.exports = {
  sendPushToTokens,
  sendPushToUser,
  sendPushToUsers
};
