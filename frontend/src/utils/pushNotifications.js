import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { API_BASE } from '../config';
import { playNotificationSound } from './sound';

let isInitialized = false;

/**
 * Initialize Push Notifications, register token with backend, and setup action listeners
 */
export const initPushNotifications = async ({ onNotificationAction } = {}) => {
  if (!Capacitor.isNativePlatform()) return;
  if (isInitialized) return;

  try {
    // 1. Check and request push notification permissions
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[Push] Permission not granted:', permStatus.receive);
      return;
    }

    // 2. Register for push notifications
    await PushNotifications.register();
    isInitialized = true;

    // 3. Listener: Device token received from Firebase
    PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] Device registered with FCM token:', token.value);
      try {
        localStorage.setItem('zenivio_fcm_token', token.value);
        const authToken = localStorage.getItem('token');
        if (authToken) {
          await sendTokenToBackend(token.value, authToken);
        }
      } catch (err) {
        console.error('[Push] Failed to save/send token:', err);
      }
    });

    // 4. Listener: Registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('[Push] Registration error:', JSON.stringify(error));
    });

    // 5. Listener: Foreground push notification received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Foreground notification received:', notification);
      playNotificationSound();
    });

    // 6. Listener: Notification clicked by user from status bar
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('[Push] Notification action performed:', notification);
      const data = notification.notification?.data || {};
      if (onNotificationAction) {
        onNotificationAction(data);
      }
    });

  } catch (error) {
    console.error('[Push] Init error:', error);
  }
};

/**
 * Send FCM token to backend API
 */
export const sendTokenToBackend = async (token, authToken) => {
  if (!token || !authToken) return;
  try {
    await fetch(`${API_BASE}/api/notifications/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        token,
        platform: Capacitor.getPlatform()
      })
    });
    console.log('[Push] FCM token successfully sent to backend');
  } catch (err) {
    console.warn('[Push] Error sending FCM token to backend:', err);
  }
};

/**
 * Unregister FCM token on logout
 */
export const unregisterPushToken = async (authToken) => {
  try {
    const token = localStorage.getItem('zenivio_fcm_token');
    if (token && authToken) {
      await fetch(`${API_BASE}/api/notifications/fcm-token/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ token })
      });
    }
    localStorage.removeItem('zenivio_fcm_token');
  } catch (err) {
    console.warn('[Push] Error unregistering token:', err);
  }
};
