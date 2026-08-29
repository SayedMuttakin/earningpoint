import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Standard Google Test Ad Unit IDs for Android (100% Fill Rate Guaranteed)
const TEST_ADMOB_IDS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  rewarded_daily: 'ca-app-pub-3940256099942544/5224354917',
  rewarded_videos: 'ca-app-pub-3940256099942544/5224354917',
  rewarded_view_ads: 'ca-app-pub-3940256099942544/5224354917',
  native: 'ca-app-pub-3940256099942544/2247696110',
  appOpen: 'ca-app-pub-3940256099942544/3419835294'
};

// Real Production Ad Unit IDs
const REAL_ADMOB_IDS = {
  banner: 'ca-app-pub-2974645883080760/3706818395',
  interstitial: 'ca-app-pub-2974645883080760/1057357952',
  rewardedInterstitial: 'ca-app-pub-2974645883080760/1057357952',
  rewarded: 'ca-app-pub-2974645883080760/6932632014',
  rewarded_daily: 'ca-app-pub-2974645883080760/6932632014',
  rewarded_videos: 'ca-app-pub-2974645883080760/6932632014',
  rewarded_view_ads: 'ca-app-pub-2974645883080760/6932632014',
  appOpen: 'ca-app-pub-2974645883080760/5445501972'
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
  setConfig(config) {
    dynamicConfig = config;
    isInitialized = false; // re-init with new config mode
    console.log('[AdMob] Dynamic config updated in AdMobService:', config);
    if (Capacitor.isNativePlatform()) {
      ensureInitialized();
    }
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
        margin: 76,
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
            margin: 76,
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

    const tryShowInterstitialUnit = async (adUnitId, isTesting) => {
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

          await AdMob.prepareInterstitial({
            adId: adUnitId,
            isTesting: isTesting
          });

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
      // 1. Try Configured Unit
      try {
        await tryShowInterstitialUnit(primaryAdId, testing);
        this.isShowingInterstitial = false;
        return;
      } catch (err1) {
        console.warn('[AdMob] Primary interstitial failed to load:', err1);
      }

      // 2. Only use Google Test fallback if test mode is explicitly ON
      if (testing && primaryAdId !== testAdId) {
        try {
          await tryShowInterstitialUnit(testAdId, true);
          this.isShowingInterstitial = false;
          return;
        } catch (err2) {
          console.warn('[AdMob] Test interstitial also failed:', err2);
        }
      }

      // 3. Complete gracefully so user flow is never blocked
      this.isShowingInterstitial = false;
      if (onSuccess) onSuccess();
      if (onDismiss) onDismiss();

    } catch (finalErr) {
      this.isShowingInterstitial = false;
      if (onSuccess) onSuccess();
      if (onDismiss) onDismiss();
    }
  },

  // Rewarded Video Ad with Multi-tier Failover
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
      if (onError) onError({ isFallback: true, message: "Ads disabled" });
      if (onDismiss) onDismiss();
      return;
    }

    if (this.isShowingRewarded) {
      if (onDismiss) onDismiss();
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      console.log('[AdMob] Not on native platform, invoking in-app video fallback.');
      if (onError) onError({ isFallback: true, message: "Non-native platform" });
      if (onDismiss) onDismiss();
      return;
    }

    this.isShowingRewarded = true;
    await ensureInitialized();
    const testing = isTestingMode();

    const primaryAdId = getAdId(placement);
    const testAdId = TEST_ADMOB_IDS.rewarded;

    const tryShowRewardedUnit = async (adUnitId, isTesting) => {
      return new Promise(async (resolve, reject) => {
        let isDone = false;
        let rewardGranted = false;
        const listeners = [];
        const cleanup = () => {
          listeners.forEach(l => l && l.remove && l.remove());
        };

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
            console.log('[AdMob] Rewarded video dismissed.');
            if (!isDone) {
              isDone = true;
              cleanup();
              if (onDismiss && !rewardGranted) onDismiss();
              resolve(false);
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

          await AdMob.prepareRewardVideoAd({
            adId: adUnitId,
            isTesting: isTesting
          });

          await AdMob.showRewardVideoAd();

          setTimeout(() => {
            if (!isDone) {
              isDone = true;
              cleanup();
              if (onDismiss && !rewardGranted) onDismiss();
              resolve(true);
            }
          }, 35000);

        } catch (err) {
          cleanup();
          reject(err);
        }
      });
    };

    try {
      // Attempt 1: Configured Primary Ad Unit
      try {
        console.log(`[AdMob] Requesting real rewarded ad unit: ${primaryAdId}, isTesting: ${testing}`);
        await tryShowRewardedUnit(primaryAdId, testing);
        this.isShowingRewarded = false;
        return;
      } catch (err1) {
        console.warn('[AdMob] Primary ad unit returned No-Fill/Failed to load:', err1);
      }

      // Attempt 2: Only use Google Test fallback if test mode is explicitly ON
      if (testing && primaryAdId !== testAdId) {
        try {
          console.log(`[AdMob] Requesting Google verified test rewarded ad: ${testAdId}`);
          await tryShowRewardedUnit(testAdId, true);
          this.isShowingRewarded = false;
          return;
        } catch (err2) {
          console.warn('[AdMob] Test ad unit failed:', err2);
        }
      }

      // Attempt 3: In-App Interactive Fallback (never crash or show raw error alert)
      this.isShowingRewarded = false;
      if (onError) {
        onError({ isFallback: true, message: "Fallback to in-app sponsored video" });
      } else if (onDismiss) {
        onDismiss();
      }

    } catch (finalErr) {
      console.error('[AdMob] All rewarded ad attempts failed:', finalErr);
      this.isShowingRewarded = false;
      if (onError) onError({ isFallback: true, message: "All attempts failed" });
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
      if (onSuccess) onSuccess();
      if (onDismiss) onDismiss();
      return;
    }
    
    await ensureInitialized();
    const testing = isTestingMode();
    const primaryAdId = getAdId('appOpen');
    const testAdId = TEST_ADMOB_IDS.appOpen;

    try {
      await AdMob.prepareInterstitial({
        adId: primaryAdId,
        isTesting: testing
      });
      await AdMob.showInterstitial();
      if (onSuccess) onSuccess();
      if (onDismiss) onDismiss();
    } catch (err) {
      console.warn('[AdMob] App open ad primary failed:', err);
      if (testing) {
        try {
          await AdMob.prepareInterstitial({
            adId: testAdId,
            isTesting: true
          });
          await AdMob.showInterstitial();
        } catch (e) {
          console.error('[AdMob] App open ad failed:', e);
        }
      }
      if (onSuccess) onSuccess();
      if (onDismiss) onDismiss();
    }
  }
};

