(function () {
    "use strict";

    // Enable nodelists to work with the spread operator
    NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

    // The event symbol used to store event data
    const EVENT_SYMBOL = Symbol("events");

    // Browser constructor
    function Browser() {
        this[EVENT_SYMBOL] = {};
        this.currentUrl = "";
        this.faviconLocs = new Map;
        this.favorites = new Map;
        this.loading = false;
        this.isFullscreen = false;
        this.roamingFolder = Windows.Storage.ApplicationData.current.roamingFolder;
        this.appView = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
    }

    Browser.prototype = {
        constructor: Browser,

        // Simple event management - listen for a particular event
        on (type, listener) {
            let listeners = this[EVENT_SYMBOL][type] || (this[EVENT_SYMBOL][type] = []);

            if (listeners.indexOf(listener) < 0) {
                listeners.push(listener);
            }
            return this;
        },

        // Simple event management - stop listening for a particular event
        off (type, listener) {
            let listeners = this[EVENT_SYMBOL][type],
                index = listeners ? listeners.indexOf(listener) : -1;

            if (index > -1) {
                listeners.splice(index, 1);
            }
            return this;
        },

        // Simple event management - trigger a particular event
        trigger (type) {
            let event = { type };
            let listeners = this[EVENT_SYMBOL][type] || [];

            listeners.forEach(listener => listener.call(this, event));
            return this;
        }
    };

    // Create browser instance
    let browser = new Browser;

    // Holds the fullscreen message timeout ID
    let fullscreenMessageTimeoutId;

    addEventListener("DOMContentLoaded", function () {
        // Get the UI elements
        Object.assign(this, {
            "addFavButton": document.querySelector("#addFavButton"),
            "backButton": document.querySelector("#backButton"),
            "citation": document.querySelector("#citation"),
            "clearCacheButton": document.querySelector("#clearCacheButton"),
            "clearFavButton": document.querySelector("#clearFavButton"),
            "container": document.querySelector(".container"),
            "element": document.querySelector("#browser"),
            "favButton": document.querySelector("#favButton"),
            "favicon": document.querySelector("#favicon"),
            "favList": document.querySelector("#favorites"),
            "favMenu": document.querySelector("#favMenu"),
            "forwardButton": document.querySelector("#forwardButton"),
            "fullscreenButton": document.querySelector("#goFullscreen"),
            "fullscreenMessage": document.querySelector("#fullscreenMessage"),
            "hideFullscreenLink": document.querySelector("#hideFullscreen"),
            "progressRing": document.querySelector(".ring"),
            "settingsButton": document.querySelector("#settingsButton"),
            "settingsMenu": document.querySelector("#settingsMenu"),
            "stopButton": document.querySelector("#stopButton"),
            "tweetIcon": document.querySelector("#tweet"),
            "urlInput": document.querySelector("#urlInput"),
            "urlDisplay": document.querySelector("#urlDisplay"),
            "webview": document.querySelector("#WebView")
        });

        // Apply the fullscreen mode
        this.applyFullscreenMode = state => {
            let mode = state;
            if (typeof state != "boolean") {
                mode = this.appView.isFullScreenMode;
                if (mode === this.isFullscreen) {
                    return;
                }
            }
            this.isFullscreen = mode;
            if (this.isFullscreen) {
                // Go fullscreen
                this.element.classList.add("fullscreen");
                this.fullscreenMessage.style.display = "block";
                this.fullscreenMessage.classList.add("show");
                this.fullscreenButton.textContent = "Exit full screen (F11)";

                // Clear the timeout again to ensure there are no race conditions
                clearTimeout(fullscreenMessageTimeoutId);
                fullscreenMessageTimeoutId = setTimeout(this.hideFullscreenMessage, 4e3);
            }
            else {
                // Hide fullscreen
                this.element.classList.remove("fullscreen");
                this.fullscreenMessage.style.display = "none";
                this.fullscreenButton.textContent = "Go full screen (F11)";
                this.hideFullscreenMessage();
            }
        };

        // Close the menu
        this.closeMenu = () => {
            if (!this.element.className.includes("animate")) {
                return;
            }
            let onTransitionEnd = () => {
                this.element.removeEventListener("transitionend", onTransitionEnd);
                this.togglePerspective();
                this.toggleFavMenu(true);
                this.scrollFavoritesToTop();
                this.toggleSettingsMenu(true);
            };

            this.element.addEventListener("transitionend", onTransitionEnd);
            this.togglePerspectiveAnimation();

            // Reset the title bar colors
            this.setDefaultAppBarColors();
        };

        // Handle keyboard shortcuts
        this.handleShortcuts = keyCode => {
            switch (keyCode) {
                case this.KEYS.ESC:
                    if (this.isFullscreen) {
                        this.appView.exitFullScreenMode();
                    }
                    break;

                case this.KEYS.F11:
                    this.appView[this.isFullscreen ? "exitFullScreenMode" : "tryEnterFullScreenMode"]();
                    break;

                case this.KEYS.L:
                    if (!this.isFullscreen) {
                        this.urlInput.focus();
                        this.urlInput.select();
                    }
                    break;
            }
        };

        // Hide the fullscreen message
        this.hideFullscreenMessage = () => {
            clearTimeout(fullscreenMessageTimeoutId);
            this.fullscreenMessage.classList.remove("show");
        };

        // Open the menu
        this.openMenu = () => {
            this.togglePerspective();

            setImmediate(() => {
                this.togglePerspectiveAnimation();

                // Adjust AppBar colors to match new background color
                this.setOpenMenuAppBarColors();
            });
        };

        // Apply CSS transitions when opening and closing the menus
        this.togglePerspective = () => {
            this.element.classList.toggle("modalview");
        };
        this.togglePerspectiveAnimation = () => {
            this.element.classList.toggle("animate");
        };

        // Hot key codes
        this.KEYS = { "ESC": 27, "L": 76, "F11": 122 };

        // Set the initial states
        this.backButton.disabled = true;
        this.forwardButton.disabled = true;

        // Use a proxy to workaround a WinRT issue with Object.assign
        this.titleBar = new Proxy(this.appView.titleBar, {
            "get": (target, key) => target[key],
            "set": (target, key, value) => (target[key] = value, true)
        });

        // Listen for fullscreen mode hot keys
        addEventListener("keydown", e => {
            let k = e.keyCode;
            if (k === this.KEYS.ESC || k === this.KEYS.F11 || (e.ctrlKey && k === this.KEYS.L)) {
                this.handleShortcuts(k);
            }
        });

        // Listen for a change in fullscreen mode
        this.appView.addEventListener("visibleboundschanged", () => this.applyFullscreenMode());

        // Listen for a click on the skewed container to close the menu
        this.container.addEventListener("click", () => this.closeMenu());

        // Listen for the hide fullscreen link
        this.hideFullscreenLink.addEventListener("click", () => this.appView.exitFullScreenMode());

        // Initialize fullscreen mode
        this.applyFullscreenMode(false);

        // Fire event
        this.trigger("init");

        // Navigate to the start page
        this.navigateTo("https://microsoftedge.github.io/JSBrowser/");
    }.bind(browser));

    // Export `browser`
    window.browser = browser;
})();
