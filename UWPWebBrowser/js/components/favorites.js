browser.on("init", function () {
    "use strict";

    // Save the list of favorites to file
    browser.saveFavorites = function () {
        this.roamingFolder.createFileAsync("favorites.json", Windows.Storage.CreationCollisionOption.replaceExisting)
        .then(function (favFile) {
            var favJSON = JSON.stringify(Array.from(browser.favorites));
            return Windows.Storage.FileIO.writeTextAsync(favFile, favJSON);
        })
        .done(function () {
            browser.readFavorites();
        });
    };

    // Retrieve the list of favorites and add them to the UI
    browser.readFavorites = function () {
        this.roamingFolder.getFileAsync("favorites.json")
            .then(function (favFile) {
                return Windows.Storage.FileIO.readTextAsync(favFile);
            })
            .done(function (favJSON) {
                // Read the list of favorites from file
                var updatedFavs = favJSON ? JSON.parse(favJSON) : [];
                var favList = document.querySelectorAll("#favMenu .favorite");
                browser.favorites.clear();
                updatedFavs.forEach(function (pair) {
                    browser.favorites.set(pair[0], pair[1]);
                });
                // Clear the favorites menu
                for (var i = 0; i < favList.length; i++) {
                    var favNode = favList[i];
                    favNode.parentNode.removeChild(favNode);
                }
                // Propagate the favorites menu with the new list
                if (browser.favorites.size > 0) {
                    var i = 1;
                    browser.favorites.forEach(function (entry, url) {
                        var favEntry = document.createElement("a");
                        favEntry.className = "favorite";
                        favEntry.addEventListener("click", function () {
                            browser.closeMenu();
                            browser.navigateTo(url);
                        });
                        favEntry.textContent = entry.title;
                        var delay = 0.06 + 0.03 * i++;
                        favEntry.style.transitionDelay = delay + "s";
                        browser.favList.appendChild(favEntry);
                        var alt = document.createElement("div");
                        alt.className = "url";
                        alt.textContent = url;
                        favEntry.appendChild(alt);
                    });
                }
            },
            function (e) {
                console.error(e.toString(), "\nUnable to get favorites");
            });
    };

    // Show or hide the favorites menu
    browser.showFavMenu = function (shown) {
        this.favMenu.style.display = shown ? "block" : "none";
    };

    // Scroll the favorites list to the top
    browser.scrollFavoritesToTop = function () {
        this.favList.scrollTop = 0;
    };

    // Listen for the favorites button to open the favorites menu
    browser.favButton.addEventListener("click", function (e) {
        this.showSettingsMenu(false);
        this.openMenu(e);
    }.bind(browser));

    // Listen for the add favorite button to save the current page to the list of favorites
    browser.addFavButton.addEventListener("click", function () {
        this.favorites.set(this.currentUrl, { 'title': this.documentTitle });
        this.saveFavorites();
    }.bind(browser));
});