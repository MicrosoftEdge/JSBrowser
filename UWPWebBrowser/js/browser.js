(function () {
    "use strict";

    // Constructor
    function Browser() {
        this._events = [];
        this.favorites = new Map;
        this.documentTitle = "";
        this.currentUrl = "";
        this.loading = false;
        this.roamingFolder = Windows.Storage.ApplicationData.current.roamingFolder;
    }

    // Simple event management - listen for a particular event
    Browser.prototype.on = function (type, listener) {
        var listeners = this._events[type] || (this._events[type] = []);

        if (listeners.indexOf(listener) < 0) {
            listeners.push(listener);
        }

        return this;
    };

    // Simple event management - stop listening for a particular event
    Browser.prototype.off = function (type, listener) {
        var listeners = this._events[type],
            index = listeners ? listeners.indexOf(listener) : -1;

        if (index > -1) {
            listeners.splice(index, 1);
        }

        return this;
    };

    // Simple event management - trigger a particular event
    Browser.prototype.trigger = function (type) {
        var event = { "type": type },
            listeners = this._events[type],
            index = -1,
            length = listeners ? listeners.length : 0;

        while (++index < length) {
            listeners[index](event);
        }

        return this;
    };

    var browser = new Browser();

    addEventListener("DOMContentLoaded", function () {
        // Get the UI elements
        browser.element = document.getElementById("browser");
        browser.webview = document.getElementById("WebView");
        browser.documentTitle = browser.webview.documentTitle;
        browser.stopButton = document.getElementById("stopButton");
        browser.forwardButton = document.getElementById("forwardButton");
        browser.backButton = document.getElementById("backButton");
        browser.favButton = document.getElementById("favButton");
        browser.addFavButton = document.getElementById("addFavButton");
        browser.clearFavButton = document.getElementById("clearFavButton");
        browser.settingsButton = document.getElementById("settingsButton");
        browser.clearCacheButton = document.getElementById("clearCacheButton");
        browser.favMenu = document.getElementById("favMenu");
        browser.settingsMenu = document.getElementById("settingsMenu");
        browser.urlInput = document.getElementById("urlInput");
        browser.container = document.querySelector(".container");
        browser.favList = document.getElementById("favorites");
        browser.favicon = document.getElementById("favicon");

        // Set the initial navigation state
        browser.forwardButton.disabled = true;
        browser.backButton.disabled = true;

        // Apply CSS transitions when opening and closing the menus
        browser.togglePerspective = function () {
            this.element.classList.toggle("modalview");
        };
        browser.togglePerspectiveAnimation = function () {
            this.element.classList.toggle("animate");
        };

        // Open the menu
        browser.openMenu = function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.togglePerspective();
            setTimeout(function () {
                this.togglePerspectiveAnimation();

                // Adjust AppBar colors to match new background color
                this.setOpenMenuAppBarColors();
            }.bind(this), 25);
        };

        // Close the menu
        browser.closeMenu = function () {
            if (this.element.className.includes("animate")) {
                var onTransitionEnd = function () {
                    this.element.removeEventListener("transitionend", onTransitionEnd);
                    this.togglePerspective();
                    this.showFavMenu(true);
                    this.scrollFavoritesToTop();
                    this.showSettingsMenu(true);
                }.bind(this);
                this.element.addEventListener("transitionend", onTransitionEnd);
                this.togglePerspectiveAnimation();

                // Reset the title bar colors
                this.setDefaultAppBarColors();
            }
        };

        // Listen for a click on the skewed container to close the menu
        browser.container.addEventListener("click", function () {
            browser.closeMenu();
        });

        // Fire event
        browser.trigger("init");
    });

    addEventListener("load", function () {
        // Refresh the data
        browser.readFavorites();

        // Brand the title bar
        browser.setDefaultAppBarColors();
    });

    window.browser = browser;
})();