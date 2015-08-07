(function () {
    "use strict";

    // Event symbol
    const EVENT_SYM = Symbol("events");

    // Shortcut keyCodes
    const KEYS = {
        "ESC": 27,
        "L": 76,
        "F11": 122
    };

    // Enable nodelists to work with the spread operator
    NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

    // Browser constructor
    function Browser() {
        this[EVENT_SYM] = {};
        this.currentUrl = "";
        this.documentTitle = "";
        this.faviconLocs = new Map;
        this.favorites = new Map;
        this.loading = false;
        this.isFullScreen = false;
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

    let browser = new Browser;

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
            "fullScreenButton": document.querySelector("#goFullScreen"),
            "fullScreenMessage": document.querySelector("#fullScreenMessage"),
            "hideFullScreenLink": document.querySelector("#hideFullScreen"),
            "progressRing": document.querySelector(".ring"),
            "settingsButton": document.querySelector("#settingsButton"),
            "settingsMenu": document.querySelector("#settingsMenu"),
            "stopButton": document.querySelector("#stopButton"),
            "tweetIcon": document.querySelector("#tweet"),
            "urlInput": document.querySelector("#urlInput"),
            "webview": document.querySelector("#WebView")
        });

        // Navigate to the start page
        this.webview.navigate("http://www.microsoft.com/");

        // Use a proxy to workaround a WinRT issue with Object.assign
        this.titleBar = new Proxy(this.appView.titleBar, {
            "get": (target, key) => target[key],
            "set": (target, key, value) => (target[key] = value, true)
        });

        // Set the initial navigation state
        this.forwardButton.disabled = true;
        this.backButton.disabled = true;

        // Listen for keyboard shortcuts in the app level
        this.shortcutScript = isWebView => {
            let marshall = isWebView ? "NotifyApp.setKeyCombination(k)" : "this.handleShortcuts(k)";
            return `addEventListener("keydown", e => { let k = e.keyCode; if (k === ${KEYS.ESC} || k === ${KEYS.F11} || (e.ctrlKey && k === ${KEYS.L})) { ${marshall}; }});`;
        };
        eval(this.shortcutScript());

        // Show full screen message
        //JHDfkshfjksdhfkjsdhdjfjdslfjsdlfjdsljflsdkjflkdsjf
        //sdjfksdjfkldsjfklsdjflsdjlkfjdslfjdsf
        //sjdfkjsdklfjdslkfjsdlfjsdlkjflksd
        //dsfjlkdsjfkldsjlfk

        // Hide the full screen message
        this.hideFullScreenMessage = () => this.fullScreenMessage.classList.remove("show");

        // Listen for the hide full screen link
        this.hideFullScreenLink.addEventListener("click", () => this.exitFullScreen());

        // Enter full screen mode
        this.enterFullScreen = () => {
            this.isFullScreen = true;
            this.appView.tryEnterFullScreenMode();
            this.element.classList.add("fullScreen");
            this.fullScreenMessage.style.display = "block";
            this.fullScreenMessage.classList.add("show");
            this.fullScreenButton.textContent = "Exit full screen";
            setTimeout(this.hideFullScreenMessage, 4000);
            this.fullScreenButton.removeEventListener("click", this.enterFullScreen);
            this.fullScreenButton.addEventListener("click", this.exitFullScreen);
        };

        // Exit full screen mode
        this.exitFullScreen = () => {
            this.isFullScreen = false;
            this.appView.exitFullScreenMode();
            this.element.classList.remove("fullScreen");
            this.fullScreenMessage.style.display = "none";
            this.hideFullScreenMessage();
            this.fullScreenButton.textContent = "Go full screen";
            this.fullScreenButton.removeEventListener("click", this.exitFullScreen);
            this.fullScreenButton.addEventListener("click", this.enterFullScreen);
        };

        // Handle keyboard shortcuts
        this.handleShortcuts = keyCode => {
            switch (keyCode) {
                case KEYS.ESC:
                    if (this.isFullScreen) {
                        this.exitFullScreen();
                    }
                    break;

                case KEYS.F11:
                    if (this.isFullScreen) {
                        this.exitFullScreen();
                    }
                    else {
                        this.enterFullScreen();
                    }
                    break;

                case KEYS.L:
                    if (!this.isFullScreen) {
                        this.urlInput.focus();
                        this.urlInput.select();
                    }
                    break;

                default:
                    break;
            }
        }

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

        // Listen for a click on the skewed container to close the menu
        this.container.addEventListener("click", () => this.closeMenu());

        // Fire event
        this.trigger("init");
    }.bind(browser));

    // Export `browser`
    window.browser = browser;
})();
