(function () {
    "use strict";

    // Event symbol
    const EVENT_SYM = Symbol("events");

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
        this.roamingFolder = Windows.Storage.ApplicationData.current.roamingFolder;
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
            "progressRing": document.querySelector(".ring"),
            "settingsButton": document.querySelector("#settingsButton"),
            "settingsMenu": document.querySelector("#settingsMenu"),
            "stopButton": document.querySelector("#stopButton"),
            "tweetIcon": document.querySelector("#tweet"),
            "urlInput": document.querySelector("#urlInput"),
            "webview": document.querySelector("#WebView")
        });

        this.documentTitle = this.webview.documentTitle;

        // Use a proxy to workaround a WinRT issue with Object.assign
        this.titleBar = new Proxy(Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar, {
            "get": (target, key) => target[key],
            "set": (target, key, value) => (target[key] = value, true)
        });

        // Set the initial navigation state
        this.forwardButton.disabled = true;
        this.backButton.disabled = true;

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
        this.openMenu = e => {
            e.stopPropagation();
            e.preventDefault();

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
