import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Global unlocked AudioContext singleton
let globalAudioCtx = null;

const getAudioContext = () => {
  if (!globalAudioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
};

// Automatically unlock AudioContext on first user touch/interaction
if (typeof window !== 'undefined') {
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };
  window.addEventListener('click', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
}

// Crisp, high-clarity 3-tone chime (C6 -> E6 -> G6)
export const playNotificationSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Tone 1: 1046.50 Hz (C6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.50, now);
    gain1.gain.setValueAtTime(0.28, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 1318.51 Hz (E6) - slight delay for chime effect
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.08);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.32, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);

    // Tone 3: 1567.98 Hz (G6) - sparkling finish
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1567.98, now + 0.16);
    gain3.gain.setValueAtTime(0.001, now);
    gain3.gain.setValueAtTime(0.35, now + 0.16);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.16);
    osc3.stop(now + 0.55);
  } catch (e) {
    console.warn('[Sound] Audio chime playback error:', e);
  }
};

let channelInitialized = false;

const ensureNotificationChannel = async () => {
  if (channelInitialized || !Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: 'zenivio_messages',
      name: 'Direct Messages',
      description: 'Incoming Zenivio chat messages and notifications',
      importance: 5, // High importance -> shows head-up banner & plays sound
      visibility: 1, // Visible on lock screen
      sound: 'default',
      vibration: true,
      lights: true,
      lightColor: '#7C3AED'
    });
    channelInitialized = true;
  } catch (err) {
    console.warn('[LocalNotifications] Channel creation error:', err);
  }
};

// Trigger status bar notification specifically for Incoming Messages
export const triggerMessageNotification = async (senderName, messageText, extraData = {}) => {
  // Always play the chime
  playNotificationSound();

  try {
    if (Capacitor.isNativePlatform()) {
      await ensureNotificationChannel();

      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') return;
      }

      const cleanSnippet = messageText 
        ? (messageText.startsWith('/api/image') ? '📷 Photo' : (messageText.length > 80 ? `${messageText.substring(0, 80)}...` : messageText))
        : 'Sent you a message';

      await LocalNotifications.schedule({
        notifications: [
          {
            title: senderName ? `${senderName} 💬` : 'New Message 💬',
            body: cleanSnippet,
            id: Math.floor(Math.random() * 1000000),
            channelId: 'zenivio_messages',
            sound: 'default',
            smallIcon: 'ic_launcher',
            schedule: { at: new Date(Date.now() + 50) },
            extra: extraData
          }
        ]
      });
    }
  } catch (e) {
    console.warn('[LocalNotifications] Message push notification error:', e);
  }
};

// General system notification (silent or without status bar spam unless requested)
export const triggerSystemNotification = async (title, body, extraData = {}) => {
  // Only play subtle chime, do not spam phone status bar
  playNotificationSound();
};

