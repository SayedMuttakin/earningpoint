package com.zenivio.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GoogleAuth.class);
        registerPlugin(AppOpenPlugin.class);
        super.onCreate(savedInstanceState);

        getBridge().addWebViewListener(new WebViewListener() {
            @Override
            public void onReceivedError(WebView webView) {
                String errorUrl = getBridge().getErrorUrl();
                if (errorUrl != null) {
                    webView.post(() -> webView.loadUrl(errorUrl));
                }
            }
        });
    }
}
