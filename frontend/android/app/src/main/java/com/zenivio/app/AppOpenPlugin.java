package com.zenivio.app;

import android.app.Activity;
import androidx.annotation.NonNull;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.appopen.AppOpenAd;

@CapacitorPlugin(name = "AppOpenAd")
public class AppOpenPlugin extends Plugin {

    private AppOpenAd appOpenAd = null;
    private boolean isShowingAd = false;

    @PluginMethod
    public void loadAndShow(final PluginCall call) {
        final String adUnitId = call.getString("adId");
        if (adUnitId == null || adUnitId.trim().isEmpty()) {
            call.reject("Ad Unit ID is required");
            return;
        }

        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        activity.runOnUiThread(() -> {
            if (isShowingAd) {
                call.resolve();
                return;
            }

            AdRequest request = new AdRequest.Builder().build();
            AppOpenAd.load(
                activity,
                adUnitId.trim(),
                request,
                new AppOpenAd.AppOpenAdLoadCallback() {
                    @Override
                    public void onAdLoaded(@NonNull AppOpenAd ad) {
                        appOpenAd = ad;
                        appOpenAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                            @Override
                            public void onAdDismissedFullScreenContent() {
                                appOpenAd = null;
                                isShowingAd = false;
                                call.resolve();
                            }

                            @Override
                            public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                                appOpenAd = null;
                                isShowingAd = false;
                                call.reject("Failed to show: " + adError.getMessage());
                            }

                            @Override
                            public void onAdShowedFullScreenContent() {
                                isShowingAd = true;
                            }
                        });
                        appOpenAd.show(activity);
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                        appOpenAd = null;
                        call.reject("Failed to load App Open ad: " + loadAdError.getMessage());
                    }
                }
            );
        });
    }
}
