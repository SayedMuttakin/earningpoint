import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Real Ad Unit IDs provided
const ADMOB_IDS = {
  interstitial: 'ca-app-pub-7161684117324999/1594218732',
  rewardedInterstitial: 'ca-app-pub-7161684117324999/7790027198',
  rewarded: 'ca-app-pub-7161684117324999/6435481873',
  native: 'ca-app-pub-7161684117324999/5630767711', // Note: Native ads are simulated using banners
  appOpen: 'ca-app-pub-7161684117324999/6476945526' // App Open Ads (fallback to interstitial)
};

export const AdMobService = {
  async showBanner() {
    try {
      await AdMob.showBanner({
        adId: ADMOB_IDS.native, // Using native ID for banner as fallback
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: false,
      });
    } catch (err) {
      console.error('Banner error:', err);
    }
  },

  async hideBanner() {
    try {
      await AdMob.hideBanner();
    } catch (err) {
      console.error('Hide banner error:', err);
    }
  },

  async showInterstitial(onClose) {
    try {
      await AdMob.prepareInterstitial({
        adId: ADMOB_IDS.interstitial,
        isTesting: false,
      });
      const listener = await AdMob.addListener('onInterstitialAdDismissed', () => {
        if (onClose) onClose();
        listener.remove();
      });
      await AdMob.showInterstitial();
    } catch (err) {
      console.error('Interstitial error:', err);
      if (onClose) onClose(); // Give reward if ad breaks
    }
  },

  async showRewarded(onReward) {
    try {
      await AdMob.prepareRewardVideoAd({
        adId: ADMOB_IDS.rewarded,
        isTesting: false,
      });
      
      const listener = await AdMob.addListener('onRewardedVideoAdRewarded', (rewardItem) => {
        if (onReward) onReward(rewardItem);
        listener.remove();
      });

      const closeListener = await AdMob.addListener('onRewardedVideoAdDismissed', () => {
        closeListener.remove();
      });

      await AdMob.showRewardVideoAd();
    } catch (err) {
      console.error('Rewarded ad error:', err);
      // Optional: fallback reward if ad fails to load
      if (onReward) onReward();
    }
  },

  async showNativeSimulatedAd() {
    try {
      await AdMob.showBanner({
        adId: ADMOB_IDS.native,
        adSize: BannerAdSize.MEDIUM_RECTANGLE,
        position: BannerAdPosition.CENTER,
        margin: 0,
        isTesting: false,
      });
    } catch (err) {
      console.error('Simulated Native error:', err);
    }
  },

  async hideNativeSimulatedAd() {
    try {
      await AdMob.hideBanner();
      await AdMob.removeBanner();
    } catch (err) {
      console.error('Hide simulated Native error:', err);
    }
  },

  async showAppOpenAd(onClose) {
    try {
      // Fallback to interstitial using the App Open Ad ID
      await AdMob.prepareInterstitial({
        adId: ADMOB_IDS.appOpen,
        isTesting: false,
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

