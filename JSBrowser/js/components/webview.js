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
        this.toggleProgressRing(true);

        // Show the stop button
        this.showStop();

        // Create the C++ Windows Runtime Component
        let winRTObject = new NativeListener.KeyHandler();

        // Listen for an app notification from the WinRT object
        winRTObject.onnotifyappevent = e => this.handleShortcuts(e.target);

        // Expose the native WinRT object on the page's global object
        this.webview.addWebAllowedObject("NotifyApp", winRTObject);
    });

    // Inject fullscreen mode hot key listener into the WebView with every page load
    this.webview.addEventListener("MSWebViewDOMContentLoaded", () => {
        let asyncOp = this.webview.invokeScriptAsync("eval", `
            addEventListener("keydown", e => {
                let k = e.keyCode;
                if (k === ${this.KEYS.ESC} || k === ${this.KEYS.F11} || (e.ctrlKey && k === ${this.KEYS.L})) {
                    NotifyApp.setKeyCombination(k);
                }
            });
        `);
        asyncOp.onerror = e => console.error(`Unable to listen for fullscreen hot keys: ${e.message}`);
        asyncOp.start();
    });

    // Listen for the navigation completion
    this.webview.addEventListener("MSWebViewNavigationCompleted", e => {
        this.loading = false;
        this.toggleProgressRing(false);
        this.getFavicon(e.uri);

        // Update the page title
        this.appView.title = this.webview.documentTitle;

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
        window.open(e.uri);
    });

    // Listen for a permission request
    this.webview.addEventListener("MSWebViewPermissionRequested", e => {
        console.log("Permission requested");
        if (e.permissionRequest.type === "geolocation") {
            e.permissionRequest.allow();
        }
    }); 
 });
