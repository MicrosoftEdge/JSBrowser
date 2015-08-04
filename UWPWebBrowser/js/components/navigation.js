browser.on("init", function () {
    "use strict";

    // Show the stop button
    browser.showStop = function () {
        this.stopButton.classList.add("stopButton");
        this.stopButton.classList.remove("refreshButton");
        this.stopButton.querySelector(".buttonLabel").textContent = "Stop";
    };

    // Show the refresh button
    browser.showRefresh = function () {
        this.stopButton.classList.remove("stopButton");
        this.stopButton.classList.add("refreshButton");
        this.stopButton.querySelector(".buttonLabel").textContent = "Refresh";
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
            this.showProgressRing(false);
            this.showRefresh();
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