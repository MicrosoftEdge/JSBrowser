browser.on("init", function () {
    "use strict";

    // Show or hide the settings menu
    browser.showSettingsMenu = function (shown) {
        this.settingsMenu.style.display = shown ? "block" : "none";
    };

    // Clear the cache of temporary web data
    browser.clearCache = function () {
        var op = MSApp.clearTemporaryWebDataAsync();
        op.oncomplete = function () {
            console.log("Temporary web data cleared successfully");
            browser.webview.refresh();
        };
        op.onerror = function (e) { console.error(e.toString(), "\nUnable to clear web data"); };
        op.start();
    };

    // Listen for the settings button to open the settings menu
    browser.settingsButton.addEventListener("click", function (e) {
        this.showFavMenu(false);
        this.openMenu(e);
    }.bind(browser));

    // Listen for the clear cache button to clear the cache
    browser.clearCacheButton.addEventListener("click", function () {
        this.clearCache();
        this.closeMenu();
    }.bind(browser));

    // Listen for the clear favorites button to empty the list of favorites
    browser.clearFavButton.addEventListener("click", function () {
        this.favorites.clear();
        this.saveFavorites();
        this.closeMenu();
    }.bind(browser));
});