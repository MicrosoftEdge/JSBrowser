browser.on("init", function () {
    "use strict";

    // Clear the cache of temporary web data
    this.clearCache = () => {
        let op = MSApp.clearTemporaryWebDataAsync();
        op.oncomplete = () => {
            console.log("Temporary web data cleared successfully");
            this.faviconLocs.clear();
            this.webview.refresh();
        };
        op.onerror = e => console.error(`Unable to clear web data: ${e.message}`);
        op.start();
    };

    // Show or hide the settings menu
    this.showSettingsMenu = shown => {
        this.settingsMenu.style.display = shown ? "block" : "none";
    };

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
    
    // Listen for the go full screen button to enter fullscreen mode
    this.fullscreenButton.addEventListener("click", () => this.appView[this.isFullscreen ? "exitFullScreenMode" : "tryEnterFullScreenMode"]());

    // Listen for the settings button to open the settings menu
    this.settingsButton.addEventListener("click", () => {
        this.showFavMenu(false);
        this.openMenu();
    });
});
