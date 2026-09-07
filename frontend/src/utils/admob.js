import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor, registerPlugin } from '@capacitor/core';

const NativeAppOpenAd = registerPlugin('AppOpenAd');

// Standard Google Test Ad Unit IDs for Android (100% Fill Rate Guaranteed)
const TEST_ADMOB_IDS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  rewardedInterstitial: 'ca-app-pub-3940256099942544/5354046379',
  rewarded_daily: 'ca-app-pub-3940256099942544/5224354917',
  rewarded_videos: 'ca-app-pub-3940256099942544/5224354917',
  rewarded_view_ads: 'ca-app-pub-3940256099942544/5224354917',
  native: 'ca-app-pub-3940256099942544/2247696110',
  appOpen: 'ca-app-pub-3940256099942544/3419835294'
};

// Real Production Ad Unit IDs provided by User
const REAL_ADMOB_IDS = {
  banner: 'ca-app-pub-2974645883080760/1360864845',
  interstitial: 'ca-app-pub-2974645883080760/8840004811',
  rewarded: 'ca-app-pub-2974645883080760/8856211482',
  rewardedInterstitial: 'ca-app-pub-2974645883080760/3517013065',
  rewarded_daily: 'ca-app-pub-2974645883080760/8856211482',
  rewarded_videos: 'ca-app-pub-2974645883080760/8856211482',
  rewarded_view_ads: 'ca-app-pub-2974645883080760/8856211482',
  native: 'ca-app-pub-2974645883080760/4061004201',
  appOpen: 'ca-app-pub-2974645883080760/7526923147'
};

const USE_TEST_ADS = false;
let dynamicConfig = null;
let isInitialized = false;

const isTestingMode = () => {
  if (dynamicConfig && typeof dynamicConfig.useTestAds === 'boolean') {
    return dynamicConfig.useTestAds;
  }
  return USE_TEST_ADS;
};

const ensureInitialized = async () => {
  if (!Capacitor.isNativePlatform()) return;
  if (isInitialized) return;
  const testing = isTestingMode();
  try {
    await AdMob.initialize({
      testingDevices: testing ? ['2077ef9a63d2b398840261c8221a0c9b'] : [],
      initializeForTesting: testing
    });
    isInitialized = true;
    console.log('[AdMob] AdMob initialized successfully, isTesting:', testing);
  } catch (e) {
    console.warn('[AdMob] Initialization warning:', e);
  }
};

const getAdId = (type) => {
  const testing = isTestingMode();
  if (testing) {
    return TEST_ADMOB_IDS[type] || TEST_ADMOB_IDS.banner;
  }

  if (dynamicConfig) {
    const keyMap = {
      banner: 'bannerAdUnitId',
      interstitial: 'interstitialAdUnitId',
      rewarded: 'rewardedAdUnitId',
      rewardedInterstitial: 'rewardedInterstitialAdUnitId',
      rewarded_daily: 'rewardedAdUnitId',
      rewarded_videos: 'rewardedAdUnitId',
      rewarded_view_ads: 'rewardedAdUnitId',
      appOpen: 'appOpenAdUnitId',
      native: 'nativeAdUnitId'
    };
    const configKey = keyMap[type] || 'rewardedAdUnitId';
    const dynamicId = dynamicConfig[configKey];
    if (dynamicId && typeof dynamicId === 'string' && dynamicId.trim() !== '') {
      return dynamicId.trim();
    }
  }

  return REAL_ADMOB_IDS[type] || REAL_ADMOB_IDS.rewarded || TEST_ADMOB_IDS[type] || TEST_ADMOB_IDS.banner;
};

export const AdMobService = {
  // Preload state flags & in-flight promises
  isRewardedReady: false,
  rewardedPreloadPromise: null,

  isRewardedInterstitialReady: false,
  rewardedInterstitialPreloadPromise: null,

  isInterstitialReady: false,
  interstitialPreloadPromise: null,

  setConfig(config) {
    dynamicConfig = config;
    isInitialized = false; // re-init with new config mode
    console.log('[AdMob] Dynamic config updated in AdMobService:', config);
    if (Capacitor.isNativePlatform()) {
      ensureInitialized().then(() => {
        this.preloadAll();
      });
    }
  },

  preloadAll() {
    if (!Capacitor.isNativePlatform()) return;
    if (dynamicConfig && dynamicConfig.showAds === false) return;
    console.log('[AdMob] Preloading all ads in background for instant playback...');
    this.preloadRewarded();
    this.preloadRewardedInterstitial();
    this.preloadInterstitial();
  },

  async preloadRewarded() {
    if (!Capacitor.isNativePlatform()) return false;
    if (dynamicConfig && dynamicConfig.showAds === false) return false;
    if (this.isRewardedReady) return true;
    if (this.rewardedPreloadPromise) return this.rewardedPreloadPromise;

    this.rewardedPreloadPromise = (async () => {
      try {
        await ensureInitialized();
        const testing = isTestingMode();
        const primaryAdId = getAdId('rewarded');
        try {
          console.log('[AdMob] Preloading Rewarded Video Ad:', primaryAdId);
          await AdMob.prepareRewardVideoAd({
            adId: primaryAdId,
            isTesting: testing
          });
          this.isRewardedReady = true;
          console.log('[AdMob] Rewarded Video Ad preloaded and ready!');
          return true;
        } catch (err) {
          console.warn('[AdMob] Preload primary rewarded video failed:', err);
          if (testing && primaryAdId !== TEST_ADMOB_IDS.rewarded) {
            await AdMob.prepareRewardVideoAd({
              adId: TEST_ADMOB_IDS.rewarded,
              isTesting: true
            });
            this.isRewardedReady = true;
            console.log('[AdMob] Test Rewarded Video Ad preloaded and ready!');
            return true;
          }
          throw err;
        }
      } catch (err) {
        this.isRewardedReady = false;
        return false;
      } finally {
        this.rewardedPreloadPromise = null;
      }
    })();

    return this.rewardedPreloadPromise;
  },

  async preloadRewardedInterstitial() {
    if (!Capacitor.isNativePlatform()) return false;
    if (dynamicConfig && dynamicConfig.showAds === false) return false;
    if (this.isRewardedInterstitialReady) return true;
    if (this.rewardedInterstitialPreloadPromise) return this.rewardedInterstitialPreloadPromise;

    this.rewardedInterstitialPreloadPromise = (async () => {
      try {
        await ensureInitialized();
        const testing = isTestingMode();
        const primaryAdId = getAdId('rewardedInterstitial');
        try {
          console.log('[AdMob] Preloading Rewarded Interstitial Ad:', primaryAdId);
          await AdMob.prepareRewardInterstitialAd({
            adId: primaryAdId,
            isTesting: testing
          });
          this.isRewardedInterstitialReady = true;
          console.log('[AdMob] Rewarded Interstitial Ad preloaded and ready!');
          return true;
        } catch (err) {
          console.warn('[AdMob] Preload primary rewarded interstitial failed:', err);
          if (testing && primaryAdId !== TEST_ADMOB_IDS.rewardedInterstitial) {
            await AdMob.prepareRewardInterstitialAd({
              adId: TEST_ADMOB_IDS.rewardedInterstitial,
              isTesting: true
            });
            this.isRewardedInterstitialReady = true;
            console.log('[AdMob] Test Rewarded Interstitial Ad preloaded and ready!');
            return true;
          }
          throw err;
        }
      } catch (err) {
        this.isRewardedInterstitialReady = false;
        return false;
      } finally {
        this.rewardedInterstitialPreloadPromise = null;
      }
    })();

    return this.rewardedInterstitialPreloadPromise;
  },

  async preloadInterstitial() {
    if (!Capacitor.isNativePlatform()) return false;
    if (dynamicConfig && dynamicConfig.showAds === false) return false;
    if (this.isInterstitialReady) return true;
    if (this.interstitialPreloadPromise) return this.interstitialPreloadPromise;

    this.interstitialPreloadPromise = (async () => {
      try {
        await ensureInitialized();
        const testing = isTestingMode();
        const primaryAdId = getAdId('interstitial');
        try {
          console.log('[AdMob] Preloading Interstitial Ad:', primaryAdId);
          await AdMob.prepareInterstitial({
            adId: primaryAdId,
            isTesting: testing
          });
          this.isInterstitialReady = true;
          console.log('[AdMob] Interstitial Ad preloaded and ready!');
          return true;
        } catch (err) {
          console.warn('[AdMob] Preload primary interstitial failed:', err);
          if (testing && primaryAdId !== TEST_ADMOB_IDS.interstitial) {
            await AdMob.prepareInterstitial({
              adId: TEST_ADMOB_IDS.interstitial,
              isTesting: true
            });
            this.isInterstitialReady = true;
            console.log('[AdMob] Test Interstitial Ad preloaded and ready!');
            return true;
          }
          throw err;
        }
      } catch (err) {
        this.isInterstitialReady = false;
        return false;
      } finally {
        this.interstitialPreloadPromise = null;
      }
    })();

    return this.interstitialPreloadPromise;
  },

  async showBanner(size = 'banner') {
    if (dynamicConfig && dynamicConfig.showAds === false) return;
    if (!Capacitor.isNativePlatform()) return;

    await ensureInitialized();
    const testing = isTestingMode();

    try {
      const adId = getAdId('banner');
      const adSize = size === 'big' ? BannerAdSize.MEDIUM_RECTANGLE : BannerAdSize.BANNER;
      
      await AdMob.showBanner({
        adId: adId,
        adSize: adSize,
        position: BannerAdPosition.BOTTOM_CENTER,
        isTesting: testing
      });
      console.log('[AdMob] Banner shown successfully');
    } catch (err) {
      console.warn('[AdMob] Banner failed to display:', err);
      if (testing) {
        try {
          await AdMob.showBanner({
            adId: TEST_ADMOB_IDS.banner,
            adSize: size === 'big' ? BannerAdSize.MEDIUM_RECTANGLE : BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            isTesting: true
          });
        } catch (testErr) {
          console.error('[AdMob] Test banner failed:', testErr);
        }
      }
    }
  },

  async hideBanner() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.hideBanner();
      await AdMob.removeBanner();
    } catch (err) {
      console.error('[AdMob] Failed to hide banner:', err);
    }
  },

  isShowingInterstitial: false,
  async showInterstitial(onSuccess = null, onError = null, onDismiss = null) {
    if (dynamicConfig && dynamicConfig.showAds === false) {
      if (onSuccess) onSuccess();
      if (onDismiss) onDismiss();
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      if (onSuccess) onSuccess();
      if (onDismiss) onDismiss();
      return;
    }
    
    if (this.isShowingInterstitial) {
      if (onDismiss) onDismiss();
      return;
    }
    this.isShowingInterstitial = true;

    await ensureInitialized();
    const testing = isTestingMode();
    const primaryAdId = getAdId('interstitial');
    const testAdId = TEST_ADMOB_IDS.interstitial;

    const executeShowInterstitial = async (needsPrepare, adUnitId, isTesting) => {
      return new Promise(async (resolve, reject) => {
        let isDone = false;
        const listeners = [];
        const cleanup = () => listeners.forEach(l => l && l.remove && l.remove());

        try {
          listeners.push(await AdMob.addListener('interstitialAdDismissed', () => {
            console.log('[AdMob] Interstitial Dismissed');
            if (!isDone) {
              isDone = true;
              cleanup();
              if (onSuccess) onSuccess();
              if (onDismiss) onDismiss();
              resolve(true);
            }
          }));

          listeners.push(await AdMob.addListener('interstitialAdFailedToLoad', (info) => {
            console.warn('[AdMob] Interstitial failed to load for:', adUnitId, info);
            if (!isDone) {
              isDone = true;
              cleanup();
              reject(info);
            }
          }));

          listeners.push(await AdMob.addListener('interstitialAdFailedToShow', (info) => {
            console.warn('[AdMob] Interstitial failed to show:', info);
            if (!isDone) {
              isDone = true;
              cleanup();
              reject(info);
            }
          }));

          if (needsPrepare) {
            await AdMob.prepareInterstitial({
              adId: adUnitId,
              isTesting: isTesting
            });
          }

          console.log('[AdMob] Showing interstitial ad immediately');
          await AdMob.showInterstitial();

          setTimeout(() => {
            if (!isDone) {
              isDone = true;
              cleanup();
              if (onSuccess) onSuccess();
              if (onDismiss) onDismiss();
              resolve(true);
            }
          }, 25000);

        } catch (err) {
          cleanup();
          reject(err);
        }
      });
    };

    try {
      // 1. If preloaded and ready, show instantly!
      if (this.isInterstitialReady) {
        this.isInterstitialReady = false;
        try {
          await executeShowInterstitial(false, primaryAdId, testing);
          this.isShowingInterstitial = false;
          this.preloadInterstitial();
          return;
        } catch (errReady) {
          console.warn('[AdMob] Showing preloaded interstitial failed:', errReady);
        }
      }

      // 2. If in-flight preload promise exists, wait on it
      if (this.interstitialPreloadPromise) {
        const ok = await this.interstitialPreloadPromise;
        if (ok && this.isInterstitialReady) {
          this.isInterstitialReady = false;
          try {
            await executeShowInterstitial(false, primaryAdId, testing);
            this.isShowingInterstitial = false;
            this.preloadInterstitial();
            return;
          } catch (errInFlight) {
            console.warn('[AdMob] In-flight preloaded interstitial show failed:', errInFlight);
          }
        }
      }

      // 3. Prepare and show on-demand
      try {
        await executeShowInterstitial(true, primaryAdId, testing);
        this.isShowingInterstitial = false;
        this.preloadInterstitial();
        return;
      } catch (err1) {
        console.warn('[AdMob] Primary interstitial on demand failed:', err1);
      }

      // 4. Test fallback if testing mode is active
      if (testing && primaryAdId !== testAdId) {
        try {
          await executeShowInterstitial(true, testAdId, true);
          this.isShowingInterstitial = false;
          this.preloadInterstitial();
          return;
        } catch (err2) {
          console.warn('[AdMob] Test interstitial failed:', err2);
        }
      }

      // 5. Strictly fail - NEVER call onSuccess on error!
      this.isShowingInterstitial = false;
      this.preloadInterstitial();
      if (onError) onError({ message: 'Interstitial ad failed to load' });
      if (onDismiss) onDismiss();

    } catch (finalErr) {
      this.isShowingInterstitial = false;
      this.preloadInterstitial();
      if (onError) onError(finalErr);
      if (onDismiss) onDismiss();
    }
  },

  // Rewarded Video Ad with Preloaded Instant Playback & Strict Reward Verification
  isShowingRewarded: false,
  async showRewarded(onReward, placementOrOnError = 'rewarded', onErrorOrDismiss = null, onDismissArg = null) {
    let placement = 'rewarded';
    let onError = null;
    let onDismiss = null;

    if (typeof placementOrOnError === 'function') {
      placement = 'rewarded';
      onError = placementOrOnError;
      onDismiss = onErrorOrDismiss;
    } else if (typeof placementOrOnError === 'string') {
      placement = placementOrOnError;
      onError = onErrorOrDismiss;
      onDismiss = onDismissArg;
    }

    if (dynamicConfig && dynamicConfig.showAds === false) {
      if (onError) onError({ message: "Ads disabled" });
      if (onDismiss) onDismiss();
      return;
    }

    if (this.isShowingRewarded) {
      if (onDismiss) onDismiss();
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      console.log('[AdMob] Not on native platform');
      if (onError) onError({ isFallback: true, message: "Ads are only available in the Android app." });
      if (onDismiss) onDismiss();
      return;
    }

    this.isShowingRewarded = true;
    await ensureInitialized();
    const testing = isTestingMode();
    const primaryAdId = getAdId(placement);
    const testAdId = TEST_ADMOB_IDS.rewarded;

    const executeShowRewarded = async (needsPrepare, adUnitId, isTesting) => {
      return new Promise(async (resolve, reject) => {
        let isDone = false;
        let rewardGranted = false;
        const listeners = [];
        const cleanup = () => listeners.forEach(l => l && l.remove && l.remove());

        try {
          listeners.push(await AdMob.addListener('onRewardedVideoAdReward', (rewardItem) => {
            console.log('[AdMob] Rewarded video completed! Calling onReward.', rewardItem);
            rewardGranted = true;
            if (!isDone) {
              isDone = true;
              cleanup();
              if (onReward) onReward(rewardItem);
              resolve(true);
            }
          }));

          listeners.push(await AdMob.addListener('onRewardedVideoAdDismissed', () => {
            console.log('[AdMob] Rewarded video dismissed. rewardGranted:', rewardGranted);
            if (!isDone) {
              isDone = true;
              cleanup();
              if (onDismiss) onDismiss();
              if (!rewardGranted && onError) {
                onError({ message: 'Ad was closed before completion. No reward earned.' });
              }
              resolve(rewardGranted);
            }
          }));

          listeners.push(await AdMob.addListener('onRewardedVideoAdFailedToLoad', (info) => {
            console.warn('[AdMob] Rewarded video failed to load for ID:', adUnitId, info);
            if (!isDone) {
              isDone = true;
              cleanup();
              reject(info);
            }
          }));

          listeners.push(await AdMob.addListener('onRewardedVideoAdFailedToShow', (info) => {
            console.warn('[AdMob] Rewarded video failed to show:', info);
            if (!isDone) {
              isDone = true;
              cleanup();
              reject(info);
            }
          }));

          if (needsPrepare) {
            console.log('[AdMob] Preparing rewarded video on demand:', adUnitId);
            await AdMob.prepareRewardVideoAd({
              adId: adUnitId,
              isTesting: isTesting
            });
          }

          console.log('[AdMob] Showing rewarded video ad instantly!');
          await AdMob.showRewardVideoAd();

          setTimeout(() => {
            if (!isDone) {
              isDone = true;
              cleanup();
              if (onDismiss) onDismiss();
              if (!rewardGranted && onError) {
                onError({ message: 'Ad timed out before completion.' });
              }
              resolve(rewardGranted);
            }
          }, 45000);

        } catch (err) {
          cleanup();
          reject(err);
        }
      });
    };

    try {
      // 1. If preloaded and ready, show instantly with 0ms delay!
      if (this.isRewardedReady) {
        this.isRewardedReady = false;
        try {
          await executeShowRewarded(false, primaryAdId, testing);
          this.isShowingRewarded = false;
          this.preloadRewarded();
          return;
        } catch (errReady) {
          console.warn('[AdMob] Preloaded rewarded ad show failed, falling back:', errReady);
        }
      }

      // 2. If in-flight preload promise exists, await it
      if (this.rewardedPreloadPromise) {
        const ok = await this.rewardedPreloadPromise;
        if (ok && this.isRewardedReady) {
          this.isRewardedReady = false;
          try {
            await executeShowRewarded(false, primaryAdId, testing);
            this.isShowingRewarded = false;
            this.preloadRewarded();
            return;
          } catch (errInFlight) {
            console.warn('[AdMob] In-flight preloaded rewarded ad show failed:', errInFlight);
          }
        }
      }

      // 3. Prepare and show on demand
      try {
        await executeShowRewarded(true, primaryAdId, testing);
        this.isShowingRewarded = false;
        this.preloadRewarded();
        return;
      } catch (err1) {
        console.warn('[AdMob] Primary rewarded ad on demand failed:', err1);
      }

      // 4. Test ad unit fallback if testing mode
      if (testing && primaryAdId !== testAdId) {
        try {
          await executeShowRewarded(true, testAdId, true);
          this.isShowingRewarded = false;
          this.preloadRewarded();
          return;
        } catch (err2) {
          console.warn('[AdMob] Test rewarded ad failed:', err2);
        }
      }

      // 5. Strictly fail - NEVER reward on error!
      this.isShowingRewarded = false;
      this.preloadRewarded();
      if (onError) onError({ message: 'Rewarded video ad failed to load. Please try again.' });
      if (onDismiss) onDismiss();

    } catch (finalErr) {
      this.isShowingRewarded = false;
      this.preloadRewarded();
      if (onError) onError({ message: 'Rewarded video ad failed to play.' });
      if (onDismiss) onDismiss();
    }
  },

  // Rewarded Interstitial Ad with Preloaded Instant Playback & Strict Reward Verification
  isShowingRewardedInterstitial: false,
  async showRewardedInterstitial(onReward, onError = null, onDismiss = null) {
    if (dynamicConfig && dynamicConfig.showAds === false) {
      if (onError) onError({ message: "Ads disabled" });
      if (onDismiss) onDismiss();
      return;
    }

    if (this.isShowingRewardedInterstitial) {
      if (onDismiss) onDismiss();
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      console.log('[AdMob] Not on native platform for rewarded interstitial.');
      if (onError) onError({ isFallback: true, message: "Ads are only available in the Android app." });
      if (onDismiss) onDismiss();
      return;
    }

    this.isShowingRewardedInterstitial = true;
    await ensureInitialized();
    const testing = isTestingMode();
    const primaryAdId = getAdId('rewardedInterstitial');
    const testAdId = TEST_ADMOB_IDS.rewardedInterstitial;

    const executeShowRewardedInterstitial = async (needsPrepare, adUnitId, isTesting) => {
      return new Promise(async (resolve, reject) => {
        let isDone = false;
        let rewardGranted = false;
        const listeners = [];
        const cleanup = () => listeners.forEach(l => l && l.remove && l.remove());

        try {
          listeners.push(await AdMob.addListener('onRewardedInterstitialAdReward', (rewardItem) => {
            console.log('[AdMob] Rewarded interstitial completed! Granting reward.', rewardItem);
            rewardGranted = true;
            if (!isDone) {
              isDone = true;
              cleanup();
              if (onReward) onReward(rewardItem);
              resolve(true);
            }
          }));

          listeners.push(await AdMob.addListener('onRewardedInterstitialAdDismissed', () => {
            console.log('[AdMob] Rewarded interstitial dismissed. rewardGranted:', rewardGranted);
            if (!isDone) {
              isDone = true;
              cleanup();
              if (onDismiss) onDismiss();
              if (!rewardGranted && onError) {
                onError({ message: 'Ad was closed before completion. No reward earned.' });
              }
              resolve(rewardGranted);
            }
          }));

          listeners.push(await AdMob.addListener('onRewardedInterstitialAdFailedToLoad', (info) => {
            console.warn('[AdMob] Rewarded interstitial failed to load for ID:', adUnitId, info);
            if (!isDone) {
              isDone = true;
              cleanup();
              reject(info);
            }
          }));

          listeners.push(await AdMob.addListener('onRewardedInterstitialAdFailedToShow', (info) => {
            console.warn('[AdMob] Rewarded interstitial failed to show:', info);
            if (!isDone) {
              isDone = true;
              cleanup();
              reject(info);
            }
          }));

          if (needsPrepare) {
            console.log('[AdMob] Preparing rewarded interstitial on demand:', adUnitId);
            await AdMob.prepareRewardInterstitialAd({
              adId: adUnitId,
              isTesting: isTesting
            });
          }

          console.log('[AdMob] Showing rewarded interstitial ad instantly!');
          await AdMob.showRewardInterstitialAd();

          setTimeout(() => {
            if (!isDone) {
              isDone = true;
              cleanup();
              if (onDismiss) onDismiss();
              if (!rewardGranted && onError) {
                onError({ message: 'Ad timed out before completion.' });
              }
              resolve(rewardGranted);
            }
          }, 45000);

        } catch (err) {
          cleanup();
          reject(err);
        }
      });
    };

    try {
      // 1. If preloaded and ready, show instantly!
      if (this.isRewardedInterstitialReady) {
        this.isRewardedInterstitialReady = false;
        try {
          await executeShowRewardedInterstitial(false, primaryAdId, testing);
          this.isShowingRewardedInterstitial = false;
          this.preloadRewardedInterstitial();
          return;
        } catch (errReady) {
          console.warn('[AdMob] Preloaded rewarded interstitial show failed, falling back:', errReady);
        }
      }

      // 2. If in-flight preload promise exists, await it
      if (this.rewardedInterstitialPreloadPromise) {
        const ok = await this.rewardedInterstitialPreloadPromise;
        if (ok && this.isRewardedInterstitialReady) {
          this.isRewardedInterstitialReady = false;
          try {
            await executeShowRewardedInterstitial(false, primaryAdId, testing);
            this.isShowingRewardedInterstitial = false;
            this.preloadRewardedInterstitial();
            return;
          } catch (errInFlight) {
            console.warn('[AdMob] In-flight preloaded rewarded interstitial show failed:', errInFlight);
          }
        }
      }

      // 3. Prepare and show on demand
      try {
        await executeShowRewardedInterstitial(true, primaryAdId, testing);
        this.isShowingRewardedInterstitial = false;
        this.preloadRewardedInterstitial();
        return;
      } catch (err1) {
        console.warn('[AdMob] Primary rewarded interstitial on demand failed:', err1);
      }

      // 4. Test ad unit fallback if testing mode
      if (testing && primaryAdId !== testAdId) {
        try {
          await executeShowRewardedInterstitial(true, testAdId, true);
          this.isShowingRewardedInterstitial = false;
          this.preloadRewardedInterstitial();
          return;
        } catch (err2) {
          console.warn('[AdMob] Test rewarded interstitial failed:', err2);
        }
      }

      // 5. Strictly fail - NEVER reward on error!
      this.isShowingRewardedInterstitial = false;
      this.preloadRewardedInterstitial();
      if (onError) onError({ message: 'Rewarded interstitial ad failed to load. Please try again.' });
      if (onDismiss) onDismiss();

    } catch (finalErr) {
      this.isShowingRewardedInterstitial = false;
      this.preloadRewardedInterstitial();
      if (onError) onError({ message: 'Rewarded interstitial ad failed to play.' });
      if (onDismiss) onDismiss();
    }
  },

  async showNativeSimulatedAd() {},
  async hideNativeSimulatedAd() {},

  async showAppOpenAd(onSuccess = null, onError = null, onDismiss = null) {
    if (dynamicConfig && dynamicConfig.showAds === false) {
      if (onSuccess) onSuccess();
      if (onDismiss) onDismiss();
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      if (onError) onError({ message: 'Ads are only available in the Android app.' });
      if (onDismiss) onDismiss();
      return;
    }
    
    await ensureInitialized();
    const primaryAdId = getAdId('appOpen');

    try {
      if (NativeAppOpenAd && typeof NativeAppOpenAd.loadAndShow === 'function') {
        console.log('[AdMob] Requesting Native Android AppOpenAd:', primaryAdId);
        await NativeAppOpenAd.loadAndShow({ adId: primaryAdId });
        console.log('[AdMob] Native AppOpenAd completed successfully');
        if (onSuccess) onSuccess();
        if (onDismiss) onDismiss();
      } else {
        await this.showInterstitial(onSuccess, onError, onDismiss);
      }
    } catch (err) {
      console.warn('[AdMob] Native App Open Ad failed:', err);
      try {
        await this.showInterstitial(onSuccess, onError, onDismiss);
      } catch (fallbackErr) {
        console.warn('[AdMob] App open fallback interstitial also failed:', fallbackErr);
        if (onError) onError(fallbackErr);
        if (onDismiss) onDismiss();
      }
    }
  }
};
