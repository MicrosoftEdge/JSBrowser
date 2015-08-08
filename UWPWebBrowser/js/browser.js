(function () {
    "use strict";

    // Enable nodelists to work with the spread operator
    NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

    // Event symbol
    const EVENT_SYM = Symbol("events");

    // Browser constructor
    function Browser() {
        this[EVENT_SYM] = {};
        this.currentUrl = "";
        this.documentTitle = "";
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
            let listeners = this[EVENT_SYM][type] || (this[EVENT_SYM][type] = []);

            if (listeners.indexOf(listener) < 0) {
                listeners.push(listener);
            }
            return this;
        },

        // Simple event management - stop listening for a particular event
        off (type, listener) {
            let listeners = this[EVENT_SYM][type],
                index = listeners ? listeners.indexOf(listener) : -1;

            if (index > -1) {
                listeners.splice(index, 1);
            }
            return this;
        },

        // Simple event management - trigger a particular event
        trigger (type) {
            let event = { type };
            let listeners = this[EVENT_SYM][type] || [];

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
            "webview": document.querySelector("#WebView")
        });

        // Close the menu
        this.closeMenu = () => {
            if (!this.element.className.includes("animate")) {
                return;
            }
            let onTransitionEnd = () => {
                this.element.removeEventListener("transitionend", onTransitionEnd);
                this.togglePerspective();
                this.showFavMenu(true);
                this.scrollFavoritesToTop();
                this.showSettingsMenu(true);
            };

            this.element.addEventListener("transitionend", onTransitionEnd);
            this.togglePerspectiveAnimation();

            // Reset the title bar colors
            this.setDefaultAppBarColors();
        };

        // Enter fullscreen mode
        this.enterFullscreen = () => {
            this.isFullscreen = true;
            this.appView.tryEnterFullScreenMode();
            this.element.classList.add("fullscreen");
            this.fullscreenMessage.style.display = "block";
            this.fullscreenMessage.classList.add("show");
            this.fullscreenButton.textContent = "Exit full screen";
            this.fullscreenButton.addEventListener("click", this.exitFullscreen);
            this.fullscreenButton.removeEventListener("click", this.enterFullscreen);

            fullscreenMessageTimeoutId = setTimeout(this.hideFullscreenMessage, 4000);
        };

        // Exit fullscreen mode
        this.exitFullscreen = () => {
            this.isFullscreen = false;
            this.appView.exitFullScreenMode();
            this.element.classList.remove("fullscreen");
            this.fullscreenMessage.style.display = "none";
            this.fullscreenButton.textContent = "Go full screen";
            this.fullscreenButton.addEventListener("click", this.enterFullscreen);
            this.fullscreenButton.removeEventListener("click", this.exitFullscreen);
            this.hideFullscreenMessage();
        };

        // Handle keyboard shortcuts
        this.handleShortcuts = keyCode => {
            switch (keyCode) {
                case this.KEYS.ESC:
                    if (this.isFullscreen) {
                        this.exitFullscreen();
                    }
                    break;

                case this.KEYS.F11:
                    this[this.isFullscreen ? "exitFullscreen" : "enterFullscreen"]();
                    break;

                case this.KEYS.L:
                    if (!this.isFullscreen) {
                        this.urlInput.focus();
                        this.urlInput.select();
                    }
                    break;
            }
        };

        // Listen for the hide fullscreen link
        this.hideFullscreenLink.addEventListener("click", () => this.exitFullscreen());

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
        this.isFullscreen = false;

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

        // Listen for a click on the skewed container to close the menu
        this.container.addEventListener("click", () => this.closeMenu());

        // Navigate to the start page
        this.webview.navigate("http://www.microsoft.com/");

        // Fire event
        this.trigger("init");
    }.bind(browser));

    // Export `browser`
    window.browser = browser;
})();
