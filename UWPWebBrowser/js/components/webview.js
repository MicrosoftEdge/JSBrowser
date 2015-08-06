browser.on("init", function () {
    "use strict";

    const URI = Windows.Foundation.Uri;

    // Listen for the navigation start
    this.webview.addEventListener("MSWebViewNavigationStarting", e => {
        this.loading = true;

        // Update the address bar
        this.currentUrl = e.uri;
        this.updateAddressBar(this.currentUrl);

        console.log(`Navigating to ${this.currentUrl}`);

        this.hideFavicon();
        this.showProgressRing(true);

        // Show the stop button
        this.showStop();

        // If local protocol, inject custom WinRT component (for demo purposes only)
        let protocol = this.currentUrl.split(":")[0];
        if (protocol === "ms-appx-web") {
            this.webview.addWebAllowedObject("CommunicatorWinRT", new ToastWinRT.ToastClass);
        }
    });

    // Listen for the navigation completion
    this.webview.addEventListener("MSWebViewNavigationCompleted", e => {
        this.loading = false;
        this.showProgressRing(false);
        this.getFavicon(e.uri);

        // Update the page title
        this.documentTitle = this.webview.documentTitle;

        // Show the refresh button
        this.showRefresh();

        // Update the navigation state
        this.updateNavState();
    });

    // Listen for unviewable content
    this.webview.addEventListener("MSWebViewUnviewableContentIdentified", e => {
        console.error(`Unviewable content: ${e.message}`);
        if (e.mediaType === "application/pdf") {
            Windows.System.Launcher.launchURIAsync(new URI(e.uri));
        }
    });

    // Listen for an unsupported URI scheme
    this.webview.addEventListener("MSWebViewUnsupportedURISchemeIdentified",
        e => console.error(`Unsupported URI scheme: ${e.message}`));

    // Listen for a new window
    this.webview.addEventListener("MSWebViewNewWindowRequested", e => {
        console.log("New window requested");
        e.preventDefault();
        this.webview.navigate(e.uri);
    });

    // Listen for a permission request
    this.webview.addEventListener("MSWebViewPermissionRequested", e => {
        console.log("Permission requested");
        if (e.permissionRequest.type === "geolocation") {
            e.permissionRequest.allow();
        }
    }); 
 });
