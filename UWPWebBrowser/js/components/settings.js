browser.on("init", function () {
    "use strict";

    // Show or hide the settings menu
    this.showSettingsMenu = (shown) => void (this.settingsMenu.style.display = shown ? "block" : "none");

    // Clear the cache of temporary web data
    this.clearCache = function () {
        let op = MSApp.clearTemporaryWebDataAsync();
        op.oncomplete = () => {
            console.log("Temporary web data cleared successfully");
            this.webview.refresh();
        };
        op.onerror = function (e) {
            console.error(`${e.message}\nUnable to clear web data`);
        };
        op.start();
    };

    // Listen for the settings button to open the settings menu
    this.settingsButton.addEventListener("click", (e) => {
        this.showFavMenu(false);
        this.openMenu(e);
    });

    // Listen for the clear cache button to clear the cache
    this.clearCacheButton.addEventListener("click", () => {
        this.clearCache();
        this.closeMenu();
    });

    // Listen for the clear favorites button to empty the list of favorites
    this.clearFavButton.addEventListener("click", () => {
        this.favorites.clear();
        this.saveFavorites();
        this.closeMenu();
    });
});