browser.on("init", function () {
    "use strict";

    // Show either the stop button or refresh button
    browser.toggleStopRefresh = function () {
        this.stopButton.classList.toggle("stopButton");
        this.stopButton.classList.toggle("refreshButton");
        this.stopButton.querySelector(".buttonLabel").textContent = this.stopButton.classList.contains("stopButton") ? "Stop" : "Refresh";
    };

    // Update the navigation state
    browser.updateNavState = function () {
        this.backButton.disabled = !this.webview.canGoBack;
        this.forwardButton.disabled = !this.webview.canGoForward;
    };

    // Listen for the stop/refresh button to stop navigation/refresh the page
    browser.stopButton.addEventListener("click", function () {
        if (this.loading) {
            this.webview.stop();
        }
        else {
            this.webview.refresh();
        }
    }.bind(browser));

    // Listen for the back button to navigate backwards
    browser.backButton.addEventListener("click", function () {
        if (this.webview.canGoBack) {
            this.webview.goBack();
        }
    }.bind(browser));

    // Listen for the forward button to navigate forwards
    browser.forwardButton.addEventListener("click", function () {
        if (this.webview.canGoForward) {
            this.webview.goForward();
        }
    }.bind(browser));
});