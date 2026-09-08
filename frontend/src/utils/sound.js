import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Global unlocked AudioContext singleton for synthetic fallback
let globalAudioCtx = null;
let htmlAudioInstance = null;

const getAudioContext = () => {
  if (!globalAudioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      try {
        globalAudioCtx = new AudioContextClass();
      } catch (e) {}
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
};

// Automatically unlock audio on first user touch/interaction
if (typeof window !== 'undefined') {
  const unlock = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if (!htmlAudioInstance) {
        htmlAudioInstance = new Audio('/notification.wav');
        htmlAudioInstance.load();
      }
    } catch (e) {}
  };
  window.addEventListener('click', unlock, { passive: true, once: true });
  window.addEventListener('touchstart', unlock, { passive: true, once: true });
  window.addEventListener('keydown', unlock, { passive: true, once: true });
}

// Synthesize pleasant 4-tone chime via Web Audio
const playSynthChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const playTone = (freq, startTime, duration, gainVal) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // C6 (1046Hz) -> E6 (1318Hz) -> G6 (1568Hz) -> C7 (2093Hz)
    playTone(1046.50, now, 0.35, 0.30);
    playTone(1318.51, now + 0.08, 0.40, 0.35);
    playTone(1567.98, now + 0.16, 0.50, 0.40);
    playTone(2093.00, now + 0.24, 0.55, 0.25);
  } catch (e) {
    console.warn('[Sound] Synth chime error:', e);
  }
};

// Play notification sound using HTML5 Audio (primary) + Web Audio synth (fallback)
export const playNotificationSound = () => {
  try {
    const audio = htmlAudioInstance || new Audio('/notification.wav');
    audio.volume = 1.0;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Fallback to Web Audio oscillator if audio element is blocked
        playSynthChime();
      });
    }
  } catch (e) {
    playSynthChime();
  }
};

const NOTIFICATION_CHANNEL_ID = 'zenivio_chat_v3';
let channelInitialized = false;

const ensureNotificationChannel = async () => {
  if (channelInitialized || !Capacitor.isNativePlatform()) return;
  try {
    try {
      await LocalNotifications.deleteChannel({ id: 'zenivio_messages' });
    } catch (e) {}

    await LocalNotifications.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: 'Zenivio Messages & Alerts',
      description: 'Incoming Zenivio chat messages and notifications',
      importance: 5, // High importance -> shows heads-up popup banner & plays sound
      visibility: 1, // Visible on lock screen
      sound: 'notification.wav',
      vibration: true,
      lights: true,
      lightColor: '#7C3AED'
    });
    channelInitialized = true;
  } catch (err) {
    console.warn('[LocalNotifications] Channel creation error:', err);
  }
};

// Proactively request notification permissions (call on app mount/login)
export const requestNotificationPermissions = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      await ensureNotificationChannel();
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  } catch (e) {
    console.warn('[Notifications] Permission request error:', e);
  }
};

// Trigger status bar notification specifically for Incoming Messages
export const triggerMessageNotification = async (senderName, messageText, extraData = {}) => {
  // Always play the crisp chime
  playNotificationSound();

  const cleanSnippet = messageText 
    ? (messageText.startsWith('/api/image') ? '📷 Photo' : (messageText.length > 80 ? `${messageText.substring(0, 80)}...` : messageText))
    : 'Sent you a message';

  const title = senderName ? `${senderName} 💬` : 'New Message 💬';

  try {
    if (Capacitor.isNativePlatform()) {
      await ensureNotificationChannel();

      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body: cleanSnippet,
            id: Math.floor(Math.random() * 1000000),
            channelId: NOTIFICATION_CHANNEL_ID,
            sound: 'notification.wav',
            smallIcon: 'ic_launcher',
            schedule: { at: new Date(Date.now() + 50) },
            extra: extraData
          }
        ]
      });
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      // Mobile / Desktop Web Notification
      new Notification(title, {
        body: cleanSnippet,
        icon: '/applogo.png',
        badge: '/favicon.png',
        tag: `msg-${Date.now()}`
      });
    }
  } catch (e) {
    console.warn('[Notifications] Message push notification error:', e);
  }
};

// General system notification (shows on native & plays sound)
export const triggerSystemNotification = async (title, body, extraData = {}) => {
  playNotificationSound();

  try {
    if (Capacitor.isNativePlatform()) {
      await ensureNotificationChannel();
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: title || 'Zenivio Notification 🔔',
              body: body || 'You have a new update',
              id: Math.floor(Math.random() * 1000000),
              channelId: NOTIFICATION_CHANNEL_ID,
              sound: 'notification.wav',
              smallIcon: 'ic_launcher',
              schedule: { at: new Date(Date.now() + 50) },
              extra: extraData
            }
          ]
        });
      }
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title || 'Zenivio Notification 🔔', {
        body: body || 'You have a new update',
        icon: '/applogo.png',
        badge: '/favicon.png'
      });
    }
  } catch (e) {
    console.warn('[Notifications] System notification error:', e);
  }
};
