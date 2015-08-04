browser.on("init", function() {
    "use strict";

    // Listen for the navigation start
    browser.webview.addEventListener("MSWebViewNavigationStarting", function (e) {
        this.loading = true;

        // Update the address bar
        this.currentUrl = e.uri;
        this.updateAddressBar();
        console.log("Navigating to", this.currentUrl);

        this.hideFavicon();
        this.showProgressRing(true);

        // Show the stop button
        this.showStop();

        // If local protocol, inject custom WinRT component (for demo purposes only)
        var protocol = this.currentUrl.split(":");
        if (protocol[0] === "ms-appx-web") {
            var communicationWinRT = new ToastWinRT.ToastClass();
            var a = communicationWinRT.getValue();
            this.webview.addWebAllowedObject("CommunicatorWinRT", communicationWinRT);
        }
    }.bind(browser));

    // Listen for the navigation completion
    browser.webview.addEventListener("MSWebViewNavigationCompleted", function (e) {
        this.loading = false;
        this.showProgressRing(false);
        this.getFavicon(e);

        // Update the page title
        this.documentTitle = this.webview.documentTitle;

        // Show the refresh button
        this.showRefresh();

        // Update the navigation state
        this.updateNavState();
    }.bind(browser));

    // Listen for any miscellaneous events
    browser.webview.addEventListener("MSWebViewUnviewableContentIdentified", unviewableContent);
    browser.webview.addEventListener("MSWebViewUnsupportedUriSchemeIdentified", unsupportedUriScheme);
    browser.webview.addEventListener("MSWebViewNewWindowRequested", newWindowRequested);
    browser.webview.addEventListener("MSWebViewPermissionRequested", permissionRequested);

    // Listen for unviewable content
    function unviewableContent (e) {
        console.error("Unviewable content:", e.toString());
        if (e.mediaType == "application/pdf") {
            var uri = new Windows.Foundation.Uri(e.uri);
            Windows.System.Launcher.launchUriAsync(uri);
        }
    }

    // Listen for an unsupported URI scheme
    function unsupportedUriScheme (e) {
        console.error(e.toString(), "\nUnsupported URI scheme:");
    }

    // Listen for a permission request
    function permissionRequested (e) {
        console.log("Permission requested");
        if (e.permissionRequest.type === 'geolocation') {
            e.permissionRequest.allow();
        }
    }

    // Listen for a new window
    function newWindowRequested (e) {
        console.log("New window requested");
        e.preventDefault();
        var webview = document.getElementById('WebView');
        browser.webview.navigate(e.uri);
    }
 });