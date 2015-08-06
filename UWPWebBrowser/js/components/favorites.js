browser.on("init", function () {
    "use strict";

    // Retrieve the list of favorites and add them to the UI
    this.readFavorites = () => {
        this.roamingFolder.getFileAsync("favorites.json")
            .then((favFile) => Windows.Storage.FileIO.readTextAsync(favFile))
            .done((favJSON) => {
                // Read the list of favorites from file
                let updatedFavs = favJSON ? JSON.parse(favJSON) : [];
                let favList = [...document.querySelectorAll("#favMenu .favorite")];

                this.favorites.clear();

                updatedFavs.forEach((pair) => void this.favorites.set(pair[0], pair[1]));

                // Clear the favorites menu
                favList.forEach((favNode) => favNode.parentNode.removeChild(favNode));

                // Propagate the favorites menu with the new list
                let i = 1;
                this.favorites.forEach((entry, url) => {
                    let favEntry = document.createElement("a");
                    favEntry.className = "favorite";
                    favEntry.textContent = entry.title;

                    favEntry.addEventListener("click", () => {
                        this.closeMenu();
                        this.navigateTo(url);
                    });

                    let delay = 0.06 + 0.03 * i++;
                    favEntry.style.transitionDelay = delay + "s";
                    this.favList.appendChild(favEntry);

                    let alt = document.createElement("div");
                    alt.className = "url";
                    alt.textContent = url;

                    favEntry.appendChild(alt);
                });
            },
            e => console.error(`Unable to get favorites: ${e.message}`)
        );
    };

    // Save the list of favorites to file
    this.saveFavorites = () => {
        this.roamingFolder
            .createFileAsync("favorites.json", Windows.Storage.CreationCollisionOption.replaceExisting)
            .then((favFile) => Windows.Storage.FileIO.writeTextAsync(favFile, JSON.stringify([...this.favorites])))
            .done(() => this.readFavorites());
    };

    // Scroll the favorites list to the top
    this.scrollFavoritesToTop = () => void (this.favList.scrollTop = 0);

    // Show or hide the favorites menu
    this.showFavMenu = shown => void (this.favMenu.style.display = shown ? "block" : "none");

    // Listen for the add favorite button to save the current page to the list of favorites
    this.addFavButton.addEventListener("click", () => {
        this.favorites.set(this.currentUrl, { "title": this.documentTitle });
        this.saveFavorites();
    });

    // Listen for the favorites button to open the favorites menu
    this.favButton.addEventListener("click", e => {
        this.showSettingsMenu(false);
        this.openMenu(e);
    });

    // Refresh the data
    this.readFavorites();
});