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
        isTesting: USE_TEST_ADS,
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
    try {
      await AdMob.prepareInterstitial({
        adId: getAdId('interstitial'),
        isTesting: USE_TEST_ADS,
      });
      const listener = await AdMob.addListener('onInterstitialAdDismissed', () => {
        if (onClose) onClose();
        listener.remove();
      });
      await AdMob.showInterstitial();
    } catch (err) {
      console.error('Interstitial error:', err);
      if (onClose) onClose();
    }
  },

  // placement: 'rewarded', 'rewarded_daily', 'rewarded_videos', 'rewarded_view_ads'
  async showRewarded(onReward, placement = 'rewarded') {
    if (!Capacitor.isNativePlatform()) {
      console.log('[AdMob] Not on native platform. Faking reward.');
      if (onReward) onReward();
      return;
    }
    try {
      const adId = getAdId(placement);
      console.log(`[AdMob] Preparing rewarded ad for placement: ${placement} (ID: ${adId})`);

      await AdMob.prepareRewardVideoAd({
        adId: adId,
        isTesting: USE_TEST_ADS,
      });
      
      const listener = await AdMob.addListener('onRewardedVideoAdRewarded', (rewardItem) => {
        console.log('[AdMob] Rewarded video finished!', rewardItem);
        if (onReward) onReward(rewardItem);
        listener.remove();
      });

      const closeListener = await AdMob.addListener('onRewardedVideoAdDismissed', () => {
        console.log('[AdMob] Rewarded video dismissed');
        closeListener.remove();
      });

      await AdMob.showRewardVideoAd();
    } catch (err) {
      console.error(`Rewarded ad error (${placement}):`, err);
      // Fallback reward in test mode if it fails
      if (USE_TEST_ADS && onReward) {
        console.warn('[AdMob] Faking reward because of error in test mode');
        onReward();
      }
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
        isTesting: USE_TEST_ADS,
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
    try {
      await AdMob.prepareInterstitial({
        adId: getAdId('appOpen'),
        isTesting: USE_TEST_ADS,
      });
      const listener = await AdMob.addListener('onInterstitialAdDismissed', () => {
        if (onClose) onClose();
        listener.remove();
      });
      await AdMob.showInterstitial();
    } catch (err) {
      console.error('App Open error:', err);
      if (onClose) onClose();
    }
  }
};
