import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Standard Google Test Ad Unit IDs for Android
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

// Real Ad Unit IDs (Update these with unique IDs per placement)
const REAL_ADMOB_IDS = {
  banner: 'ca-app-pub-2974645883080760/8899354808',
  interstitial: 'ca-app-pub-2974645883080760/5216094812',
  rewardedInterstitial: 'ca-app-pub-2974645883080760/1057357952',
  rewarded: 'ca-app-pub-2974645883080760/6644726557',
  rewarded_daily: 'ca-app-pub-2974645883080760/6644726557',
  rewarded_videos: 'ca-app-pub-2974645883080760/6644726557',
  rewarded_view_ads: 'ca-app-pub-2974645883080760/6644726557',
  appOpen: 'ca-app-pub-2974645883080760/5123193103'
};

// Toggle for Test Mode (Set to false for production so it defaults to REAL_ADMOB_IDS)
const USE_TEST_ADS = false;

let dynamicConfig = null;

const getAdId = (type) => {
  // Check if we have dynamic config from the database
  if (dynamicConfig) {
    // Check if test ads are explicitly enabled from settings
    if (dynamicConfig.useTestAds === true) {
      return TEST_ADMOB_IDS[type] || TEST_ADMOB_IDS.banner;
    }
    const keyMap = {
      banner: 'bannerAdUnitId',
      interstitial: 'interstitialAdUnitId',
      rewarded: 'rewardedAdUnitId',
      rewarded_daily: 'rewardedAdUnitId',
      rewarded_videos: 'rewardedAdUnitId',
      rewarded_view_ads: 'rewardedAdUnitId',
      appOpen: 'appOpenAdUnitId'
    };
    const configKey = keyMap[type];
    const dynamicId = dynamicConfig[configKey];
    if (dynamicId && dynamicId.trim() !== '') {
      return dynamicId;
    }
  }

  // Fall back to test ads if in test mode
  if (USE_TEST_ADS) {
    return TEST_ADMOB_IDS[type] || TEST_ADMOB_IDS.banner;
  }
  
  // Otherwise return hardcoded real ID or fall back to test ID if not declared
  return REAL_ADMOB_IDS[type] || TEST_ADMOB_IDS[type] || TEST_ADMOB_IDS.banner;
};

export const AdMobService = {
  setConfig(config) {
    dynamicConfig = config;
    console.log('[AdMob] Dynamic config loaded:', config);
  },

  async showBanner(size = 'banner') {
    if (dynamicConfig && dynamicConfig.showAds === false) {
      console.log('[AdMob] Ads are disabled via admin panel.');
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      console.log('[AdMob] Not native platform, skipping native banner.');
      return;
    }

    try {
      const adId = getAdId('banner');
      const adSize = size === 'big' ? BannerAdSize.MEDIUM_RECTANGLE : BannerAdSize.BANNER;
      
      await AdMob.showBanner({
        adId: adId,
        adSize: adSize,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 76,
        isTesting: false
      });
      console.log('[AdMob] Banner shown successfully');
    } catch (err) {
      console.error('[AdMob] Failed to show banner:', err);
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

  async showInterstitial(onSuccess = null, onError = null, onDismiss = null) {
    if (dynamicConfig && dynamicConfig.showAds === false) {
      console.log('[AdMob] Ads are disabled via admin panel.');
      if (onError) onError("Ads are currently disabled by Admin.");
      else if (onSuccess) onSuccess();
      if (onDismiss) onDismiss();
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      console.log('[AdMob] Not native platform.');
      if (onError) onError("AdMob ads can only be viewed inside the Android Mobile App.");
      else if (onSuccess) onSuccess();
      if (onDismiss) onDismiss();
      return;
    }
    
    if (this.isShowingInterstitial) {
      console.warn('[AdMob] Interstitial already showing, skipping...');
      if (onDismiss) onDismiss();
      return;
    }
    this.isShowingInterstitial = true;

    let isHandled = false;
    const cleanup = (listeners) => {
      if (Array.isArray(listeners)) {
        listeners.forEach(l => l && l.remove && l.remove());
      }
      this.isShowingInterstitial = false;
    };

    try {
      console.log('[AdMob] Preparing Interstitial...');
      const listeners = [];

      listeners.push(await AdMob.addListener('interstitialAdDismissed', () => {
        console.log('[AdMob] Interstitial Dismissed');
        if (!isHandled) {
          isHandled = true;
          if (onSuccess) onSuccess();
          if (onDismiss) onDismiss();
        }
        cleanup(listeners);
      }));

      listeners.push(await AdMob.addListener('interstitialAdFailedToLoad', (info) => {
        console.error('[AdMob] Interstitial failed to load:', info);
        if (!isHandled) {
          isHandled = true;
          if (onError) onError("Ad failed to load from AdMob. Please check internet connection and try again.");
          else if (onSuccess) onSuccess();
          if (onDismiss) onDismiss();
        }
        cleanup(listeners);
      }));

      listeners.push(await AdMob.addListener('interstitialAdFailedToShow', (info) => {
        console.error('[AdMob] Interstitial failed to show:', info);
        if (!isHandled) {
          isHandled = true;
          if (onError) onError("Ad failed to show. Please try again in a moment.");
          else if (onSuccess) onSuccess();
          if (onDismiss) onDismiss();
        }
        cleanup(listeners);
      }));

      await AdMob.prepareInterstitial({
        adId: getAdId('interstitial'),
      });

      // Show it
      await AdMob.showInterstitial();
      
      // Safety timeout in case no event fires (30s)
      setTimeout(() => {
        if (this.isShowingInterstitial && !isHandled) {
          console.warn('[AdMob] Safety timeout reached for interstitial ad.');
          isHandled = true;
          if (onDismiss) onDismiss();
          cleanup(listeners);
        }
      }, 30000);

    } catch (err) {
      console.error('Interstitial error:', err);
      if (!isHandled) {
        isHandled = true;
        if (onError) onError("Ad unavailable right now. Please try again later.");
        else if (onSuccess) onSuccess();
        if (onDismiss) onDismiss();
      }
      this.isShowingInterstitial = false;
    }
  },

  // placement: 'rewarded', 'rewarded_daily', 'rewarded_videos', 'rewarded_view_ads'
  isShowingRewarded: false,
  async showRewarded(onReward, placement = 'rewarded', onError = null, onDismiss = null) {
    if (dynamicConfig && dynamicConfig.showAds === false) {
      console.log('[AdMob] Ads are disabled via admin panel.');
      if (onError) onError("Ads are currently disabled by Admin.");
      if (onDismiss) onDismiss();
      return;
    }

    if (this.isShowingRewarded) {
      console.warn('[AdMob] Reward video already showing or loading.');
      if (onDismiss) onDismiss();
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      console.log('[AdMob] Not on native platform.');
      if (onError) onError("AdMob ads can only be viewed inside the Android Mobile App.");
      if (onDismiss) onDismiss();
      return;
    }

    this.isShowingRewarded = true;
    let rewardGranted = false;
    let isHandled = false;
    const adId = getAdId(placement);
    
    console.log(`[DEBUG-ADMOB] Preparing rewarded ad: ${placement} (ID: ${adId})`);

    const cleanup = (listeners) => {
      if (Array.isArray(listeners)) {
        listeners.forEach(l => l && l.remove && l.remove());
      }
      this.isShowingRewarded = false;
    };

    try {
      const listeners = [];

      // 1. Reward Listener
      listeners.push(await AdMob.addListener('onRewardedVideoAdReward', (rewardItem) => {
        console.log('[DEBUG-ADMOB] Reward video finished! Calling onReward.', rewardItem);
        rewardGranted = true;
        if (onReward) onReward(rewardItem);
      }));

      // 2. Dismissed Listener
      listeners.push(await AdMob.addListener('onRewardedVideoAdDismissed', () => {
        console.log('[DEBUG-ADMOB] Reward video dismissed');
        if (!isHandled) {
          isHandled = true;
          if (onDismiss && !rewardGranted) {
            onDismiss();
          }
        }
        cleanup(listeners);
      }));

      // 3. Failed to Load Listener
      listeners.push(await AdMob.addListener('onRewardedVideoAdFailedToLoad', (info) => {
        console.error('[DEBUG-ADMOB] Reward video failed to load:', info);
        if (!isHandled) {
          isHandled = true;
          if (onError) onError("Ad failed to load from AdMob. Please check internet connection and try again.");
          if (onDismiss) onDismiss();
        }
        cleanup(listeners);
      }));

      // 4. Failed to Show Listener
      listeners.push(await AdMob.addListener('onRewardedVideoAdFailedToShow', (info) => {
        console.error('[DEBUG-ADMOB] Reward video failed to show:', info);
        if (!isHandled) {
          isHandled = true;
          if (onError) onError("Ad failed to show. Please try again in a moment.");
          if (onDismiss) onDismiss();
        }
        cleanup(listeners);
      }));

      // Prepare
      await AdMob.prepareRewardVideoAd({ adId });
      
      // Show
      await AdMob.showRewardVideoAd();

      // Safety timeout in case no event fires (30s)
      setTimeout(() => {
        if (this.isShowingRewarded && !isHandled) {
          console.warn('[DEBUG-ADMOB] Safety timeout reached for rewarded ad.');
          isHandled = true;
          if (onDismiss && !rewardGranted) onDismiss();
          cleanup(listeners);
        }
      }, 30000);

    } catch (err) {
      console.error(`[DEBUG-ADMOB] Catch error during rewarded ad (${placement}):`, err);
      if (!isHandled) {
        isHandled = true;
        if (onError) onError("Ad unavailable right now. Please try again later.");
        if (onDismiss) onDismiss();
      }
      this.isShowingRewarded = false;
    }
  },

  async showNativeSimulatedAd() {
    // Disabled simulated native overlays
  },

  async hideNativeSimulatedAd() {
    // Disabled simulated native overlays
  },

  async showAppOpenAd(onSuccess = null, onError = null, onDismiss = null) {
    if (dynamicConfig && dynamicConfig.showAds === false) {
      console.log('[AdMob] Ads are disabled via admin panel.');
      if (onError) onError("Ads are currently disabled by Admin.");
      else if (onSuccess) onSuccess();
      if (onDismiss) onDismiss();
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      if (onError) onError("AdMob ads can only be viewed inside the Android Mobile App.");
      else if (onSuccess) onSuccess();
      if (onDismiss) onDismiss();
      return;
    }
    
    let isFinished = false;
    const cleanup = (listeners) => {
      if (Array.isArray(listeners)) {
        listeners.forEach(l => l && l.remove && l.remove());
      }
    };

    try {
      console.log('[AdMob] Preparing App Open Ad (using Interstitial ID)...');
      const listeners = [];

      listeners.push(await AdMob.addListener('interstitialAdDismissed', () => {
        console.log('[AdMob] App Open Ad Dismissed');
        if (!isFinished) {
          isFinished = true;
          if (onSuccess) onSuccess();
          if (onDismiss) onDismiss();
        }
        cleanup(listeners);
      }));

      listeners.push(await AdMob.addListener('interstitialAdFailedToLoad', (info) => {
        console.error('[AdMob] App Open Ad failed to load:', info);
        if (!isFinished) {
          isFinished = true;
          if (onError) onError("Ad failed to load. Please try again.");
          else if (onSuccess) onSuccess();
          if (onDismiss) onDismiss();
        }
        cleanup(listeners);
      }));

      await AdMob.prepareInterstitial({
        adId: getAdId('appOpen'),
      });

      await AdMob.showInterstitial();
      
      // Safety timeout
      setTimeout(() => {
        if (!isFinished) {
          isFinished = true;
          if (onDismiss) onDismiss();
          cleanup(listeners);
        }
      }, 30000);

    } catch (err) {
      console.error('App Open error:', err);
      if (!isFinished) {
        isFinished = true;
        if (onError) onError("Ad unavailable right now. Please try again later.");
        else if (onSuccess) onSuccess();
        if (onDismiss) onDismiss();
      }
    }
  }
};
