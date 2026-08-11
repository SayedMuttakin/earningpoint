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
  interstitial: 'ca-app-pub-7161684117324999/1594218732',
  rewardedInterstitial: 'ca-app-pub-7161684117324999/7790027198',
  rewarded: 'ca-app-pub-7161684117324999/6435481873',
  rewarded_daily: 'ca-app-pub-7161684117324999/6435481873', // Daily Checkin
  rewarded_videos: 'ca-app-pub-7161684117324999/6435481873', // Videos (+25)
  rewarded_view_ads: 'ca-app-pub-7161684117324999/6435481873', // View Ads (+10)
  native: 'ca-app-pub-7161684117324999/5630767711',
  appOpen: 'ca-app-pub-7161684117324999/6476945526'
};

// Toggle for Test Mode (Set to false for production to default to REAL_ADMOB_IDS)
const USE_TEST_ADS = true;

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

  async showBanner() {
    // Disabled native banner overlays to prevent covering bottom navigation bar
  },

  async hideBanner() {
    // Disabled native banner overlays
  },

  async showInterstitial(onClose) {
    if (dynamicConfig && dynamicConfig.showAds === false) {
      console.log('[AdMob] Ads are disabled via admin panel. Bypassing Interstitial...');
      if (onClose) onClose();
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      if (onClose) onClose();
      return;
    }
    
    if (this.isShowingInterstitial) {
      console.warn('[AdMob] Interstitial already showing, skipping...');
      return;
    }
    this.isShowingInterstitial = true;

    let isFinished = false;
    const safeClose = () => {
      if (!isFinished) {
        isFinished = true;
        this.isShowingInterstitial = false;
        if (onClose) onClose();
      }
    };

    try {
      console.log('[AdMob] Preparing Interstitial...');
      await AdMob.prepareInterstitial({
        adId: getAdId('interstitial'),
      });

      const dismissListener = await AdMob.addListener('interstitialAdDismissed', () => {
        console.log('[AdMob] Interstitial Dismissed');
        safeClose();
        dismissListener.remove();
      });

      const loadFailListener = await AdMob.addListener('interstitialAdFailedToLoad', (info) => {
        console.error('[AdMob] Interstitial failed to load:', info);
        safeClose();
        loadFailListener.remove();
      });

      const showFailListener = await AdMob.addListener('interstitialAdFailedToShow', (info) => {
        console.error('[AdMob] Interstitial failed to show:', info);
        safeClose();
        showFailListener.remove();
      });

      // Show it
      await AdMob.showInterstitial();
      
      // Safety timeout
      setTimeout(safeClose, 30000);

    } catch (err) {
      console.error('Interstitial error:', err);
      safeClose();
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
    const adId = getAdId(placement);
    
    console.log(`[DEBUG-ADMOB] Preparing rewarded ad: ${placement} (ID: ${adId})`);

    const cleanup = (listeners) => {
      listeners.forEach(l => l.remove());
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
        if (onDismiss && !rewardGranted) {
          onDismiss();
        }
        cleanup(listeners);
      }));

      // 3. Failed to Load Listener
      listeners.push(await AdMob.addListener('onRewardedVideoAdFailedToLoad', (info) => {
        console.error('[DEBUG-ADMOB] Reward video failed to load:', info);
        if (onError) onError("Ad failed to load from AdMob. Please try again in a few moments.");
        if (onDismiss) onDismiss();
        cleanup(listeners);
      }));

      // 4. Failed to Show Listener
      listeners.push(await AdMob.addListener('onRewardedVideoAdFailedToShow', (info) => {
        console.error('[DEBUG-ADMOB] Reward video failed to show:', info);
        if (onError) onError("Ad failed to show. Please try again.");
        if (onDismiss) onDismiss();
        cleanup(listeners);
      }));

      // Prepare
      await AdMob.prepareRewardVideoAd({ adId });
      
      // Show
      await AdMob.showRewardVideoAd();

      // Safety timeout in case no event fires (e.g. plugin hang)
      setTimeout(() => {
        if (this.isShowingRewarded) {
          console.warn('[DEBUG-ADMOB] Safety timeout reached for rewarded ad.');
          if (onDismiss && !rewardGranted) onDismiss();
          cleanup(listeners);
        }
      }, 30000);

    } catch (err) {
      console.error(`[DEBUG-ADMOB] Catch error during rewarded ad (${placement}):`, err);
      if (onError) onError("Ad unavailable right now. Please try again later.");
      if (onDismiss) onDismiss();
      this.isShowingRewarded = false;
    }
  },

  async showNativeSimulatedAd() {
    // Disabled simulated native overlays
  },

  async hideNativeSimulatedAd() {
    // Disabled simulated native overlays
  },

  async showAppOpenAd(onClose) {
    if (dynamicConfig && dynamicConfig.showAds === false) {
      console.log('[AdMob] Ads are disabled via admin panel. Bypassing App Open...');
      if (onClose) onClose();
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      if (onClose) onClose();
      return;
    }
    
    let isFinished = false;
    const safeClose = () => {
      if (!isFinished) {
        isFinished = true;
        if (onClose) onClose();
      }
    };

    try {
      console.log('[AdMob] Preparing App Open Ad (using Interstitial ID)...');
      await AdMob.prepareInterstitial({
        adId: getAdId('appOpen'),
      });

      const dismissListener = await AdMob.addListener('interstitialAdDismissed', () => {
        console.log('[AdMob] App Open Ad Dismissed');
        safeClose();
        dismissListener.remove();
      });

      const failListener = await AdMob.addListener('interstitialAdFailedToLoad', (info) => {
        console.error('[AdMob] App Open Ad failed to load:', info);
        safeClose();
        failListener.remove();
      });

      await AdMob.showInterstitial();
      
      // Safety timeout
      setTimeout(safeClose, 30000);

    } catch (err) {
      console.error('App Open error:', err);
      safeClose();
    }
  }
};
