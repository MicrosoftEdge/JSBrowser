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

            listeners.forEach((listener) => listener.call(this, event));
            return this;
        }
    };

    let browser = new Browser;

    addEventListener("DOMContentLoaded", function () {
        // Get the UI elements
        this.addFavButton = document.querySelector("#addFavButton");
        this.backButton = document.querySelector("#backButton");
        this.clearCacheButton = document.querySelector("#clearCacheButton");
        this.clearFavButton = document.querySelector("#clearFavButton");
        this.container = document.querySelector(".container");
        this.element = document.querySelector("#browser");
        this.favButton = document.querySelector("#favButton");
        this.favicon = document.querySelector("#favicon");
        this.favList = document.querySelector("#favorites");
        this.favMenu = document.querySelector("#favMenu");
        this.forwardButton = document.querySelector("#forwardButton");
        this.progressRing = document.querySelector(".ring");
        this.settingsButton = document.querySelector("#settingsButton");
        this.settingsMenu = document.querySelector("#settingsMenu");
        this.stopButton = document.querySelector("#stopButton");
        this.tweetIcon = document.querySelector("#tweet");
        this.urlInput = document.querySelector("#urlInput");
        this.webview = document.querySelector("#WebView");

        this.documentTitle = this.webview.documentTitle;

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

            setTimeout(() => {
                this.togglePerspectiveAnimation();

                // Adjust AppBar colors to match new background color
                this.setOpenMenuAppBarColors();
            }, 25);
        };

        // Apply CSS transitions when opening and closing the menus
        this.togglePerspective = () => void this.element.classList.toggle("modalview");
        this.togglePerspectiveAnimation = () => void this.element.classList.toggle("animate");

        // Listen for a click on the skewed container to close the menu
        this.container.addEventListener("click", () => this.closeMenu());

        // Fire event
        this.trigger("init");
    }.bind(browser));

    // Export `browser`
    window.browser = browser;
})();