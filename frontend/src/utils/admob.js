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

// Toggle for Test Mode (Set to false for production)
const USE_TEST_ADS = true;

const getAdId = (type) => {
  if (USE_TEST_ADS) {
    return TEST_ADMOB_IDS[type] || TEST_ADMOB_IDS.banner;
  }
  return REAL_ADMOB_IDS[type] || REAL_ADMOB_IDS.interstitial;
};

export const AdMobService = {
  async showBanner() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.showBanner({
        adId: getAdId('banner'),
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
    } catch (err) {
      console.error('Banner error:', err);
    }
  },

  async hideBanner() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.hideBanner();
    } catch (err) {
      console.error('Hide banner error:', err);
    }
  },

  async showInterstitial(onClose) {
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
    if (this.isShowingRewarded) {
      console.warn('[AdMob] Reward video already showing or loading.');
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      console.log('[AdMob] Not on native platform. Faking reward.');
      if (onReward) onReward();
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
        if (!rewardGranted) {
          console.warn('[DEBUG-ADMOB] Video dismissed but no reward event fired yet.');
          // In some cases, reward event fires AFTER dismissal or not at all if skipped early.
        }
        if (onDismiss && !rewardGranted) {
            onDismiss(); // Only fire onDismiss if they didn't get reward (since reward handles isLoading)
        }
        cleanup(listeners);
      }));

      // 3. Failed to Load Listener
      listeners.push(await AdMob.addListener('onRewardedVideoAdFailedToLoad', (info) => {
        console.error('[DEBUG-ADMOB] Reward video failed to load:', info);
        if (onError) onError("Ad failed to load. Please try again later.");
        cleanup(listeners);
      }));

      // 4. Failed to Show Listener
      listeners.push(await AdMob.addListener('onRewardedVideoAdFailedToShow', (info) => {
        console.error('[DEBUG-ADMOB] Reward video failed to show:', info);
        if (onError) onError("Ad failed to show. Please try again.");
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
      }, 45000);

    } catch (err) {
      console.error(`[DEBUG-ADMOB] Catch error during rewarded ad (${placement}):`, err);
      if (onError) onError("Error loading ad.");
      this.isShowingRewarded = false;
    }
  },

  async showNativeSimulatedAd() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.showBanner({
        adId: getAdId('native'),
        adSize: BannerAdSize.MEDIUM_RECTANGLE,
        position: BannerAdPosition.CENTER,
        margin: 0,
      });
    } catch (err) {
      console.error('Simulated Native error:', err);
    }
  },

  async hideNativeSimulatedAd() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.hideBanner();
      await AdMob.removeBanner();
    } catch (err) {
      console.error('Hide simulated Native error:', err);
    }
  },

  async showAppOpenAd(onClose) {
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
