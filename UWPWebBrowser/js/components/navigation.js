browser.on("init", function () {
    "use strict";

    // Show the stop button
    this.showStop = () => {
        this.stopButton.classList.add("stopButton");
        this.stopButton.classList.remove("refreshButton");
        this.stopButton.title = "Stop loading";
    };

    // Show the refresh button
    this.showRefresh = () => {
        this.stopButton.classList.remove("stopButton");
        this.stopButton.classList.add("refreshButton");
        this.stopButton.title = "Refresh the page";
    };

    // Update the navigation state
    this.updateNavState = () => {
        this.backButton.disabled = !this.webview.canGoBack;
        this.forwardButton.disabled = !this.webview.canGoForward;
    };

    // Listen for the stop/refresh button to stop navigation/refresh the page
    this.stopButton.addEventListener("click", () => {
        if (this.loading) {
            this.webview.stop();
            this.showProgressRing(false);
            this.showRefresh();
        }
        else {
            this.webview.refresh();
        }
    });

    // Listen for the back button to navigate backwards
    this.backButton.addEventListener("click", () => {
        if (this.webview.canGoBack) {
            this.webview.goBack();
        }
    });

    // Listen for the forward button to navigate forwards
    this.forwardButton.addEventListener("click", () => {
        if (this.webview.canGoForward) {
            this.webview.goForward();
        }
    });
});