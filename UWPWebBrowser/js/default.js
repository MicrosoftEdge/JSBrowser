// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=392286
(function () {
    "use strict";

    var activation = Windows.ApplicationModel.Activation;
    var applicationData = Windows.Storage.ApplicationData.current;
    var roamingFolder = applicationData.roamingFolder;
    var favorites = new Map;
    var currentUrl = "";
    var loading = true;

    document.addEventListener("DOMContentLoaded", function () {
        // Refresh the data
        readFavorites();
        applicationCache.addEventListener("datachanged", dataChangedHandler);

        // Get the UI elements
        var webview = document.getElementById("WebView");
        var documentTitle = webview.documentTitle;
        var stopButton = document.getElementById("stopButton");

        var backButton = document.getElementById("backButton");
        var favButton = document.getElementById("favButton");
        var addFavButton = document.getElementById("addFavButton");
        var clearFavButton = document.getElementById("clearFavButton");
        var settingsButton = document.getElementById("settingsButton");
        var clearCacheButton = document.getElementById("clearCacheButton");
        var favMenu = document.getElementById("favMenu");
        var settingsMenu = document.getElementById("settingsMenu");
        var urlInput = document.getElementById("urlInput");
        var browser = document.getElementById("browser");
        var container = document.querySelector(".container")
        var wrapper = document.querySelector(".wrapper");

        // Set the initial navigation state
        var forwardButton = document.getElementById("forwardButton");
        forwardButton.disabled = true;

        var backButton = document.getElementById("backButton");
        backButton.disabled = true;

        // Listen for the navigation start
        webview.addEventListener("MSWebViewNavigationStarting", function (e) {
            loading = true;

            // Update the address bar
            currentUrl = e.uri;
            urlInput.value = currentUrl;
            urlInput.blur();
            console.log("Navigating to", currentUrl);

            // Hide the favicon
            document.querySelector("#favicon").src = "";

            // Show the progress ring
            document.querySelector(".ring").style.display = "inline-block";

            // Show the stop button
            stopButton.className = "navButton stopButton";
            stopButton.innerHTML = "<span class=\"buttonLabel\">Stop</span>";

            // If local protocol, inject custom WinRT component (for demo purposes only)
            var protocol = currentUrl.split(":");
            if (protocol[0] === "ms-appx-web") {
                var communicationWinRT = new ToastWinRT.ToastClass();
                var a = communicationWinRT.getValue();
                webview.addWebAllowedObject("CommunicatorWinRT", communicationWinRT);
            }
        });

        // Listen for the navigation completion
        webview.addEventListener("MSWebViewNavigationCompleted", function (e) {
            loading = false;

            // Hide the progress ring
            document.querySelector(".ring").style.display = "none";

            // Check if there is a favicon in the root directory
            var currentUrl = e.uri;
            var protocol = currentUrl.split(":");
            if (protocol[0].slice(0, 4) === "http") {
                var host = currentUrl.match(/:\/\/([^\/]+)/);
                if (host !== null) {
                    var favicon = protocol[0] + "://" + host[1] + "/favicon.ico";
                    if (fileExists(favicon)) {
                        console.log("Favicon found:", favicon);
                        document.querySelector("#favicon").src = favicon;
                    }
                    else {
                        // Asynchronously check for a favicon in the web page markup
                        console.log("Favicon not found in root. Checking the markup...");
                        var script = "(function () {var n = document.getElementsByTagName('link'); for (var i = 0; i < n.length; i++) { if (n[i].getAttribute('rel').includes('icon')) { return n[i].href; }}})();";

                        var asyncOp = webview.invokeScriptAsync("eval", script);
                        asyncOp.oncomplete = function (e) {
                            var path = e.target.result;
                            console.log("Found favicon in markup:", path);
                            document.querySelector("#favicon").src = path;
                        };

                        asyncOp.onerror = function (e) {
                            console.error(e, "Unable to find favicon in markup");
                        };

                        asyncOp.start();
                    }
                }
            }

            // Update the page title
            documentTitle = webview.documentTitle;

            // Show the refresh button
            stopButton.className = "navButton refreshButton";
            stopButton.innerHTML = "<span class=\"buttonLabel\">Refresh</span>";

            // Update the navigation state
            backButton.disabled = !webview.canGoBack;
            forwardButton.disabled = !webview.canGoForward;
        });

        // Listen for any miscellaneous events
        webview.addEventListener("MSWebViewUnviewableContentIdentified", unviewableContent);
        webview.addEventListener("MSWebViewUnsupportedUriSchemeIdentified", unsupportedUriScheme);
        webview.addEventListener("MSWebViewNewWindowRequested", newWindowRequested);
        webview.addEventListener("MSWebViewPermissionRequested", permissionRequested);

        // Listen for the stop/refresh button to stop navigation/refresh the page
        stopButton.addEventListener("click", function () {
            if (loading) {
                webview.stop();
            }
            else {
                webview.refresh();
            }
        });

        // Listen for the Enter key in the address bar to navigate to the specified URL
        urlInput.addEventListener("keypress", function (e) {
            if (e.keyCode == 13) {
                navigateTo(urlInput.value);
            }
        });

        // Listen for focus on the address bar to auto-select the text
        urlInput.addEventListener("focus", function (e) {
            // Workaround to prevent the text from being immediately unselected
            setTimeout(function () {
                this.select();
            }.bind(this), 10);
        });

        // Listen for the loss of focus on the address bar to unselect the text
        urlInput.addEventListener("blur", function () {
            window.getSelection().removeAllRanges();
        });

        // Listen for the back button to navigate backwards
        backButton.addEventListener("click", function () {
            if (webview.canGoBack) {
                webview.goBack();
            }
        });

        // Listen for the forward button to navigate forwards
        forwardButton.addEventListener("click", function () {
            if (webview.canGoForward) {
                webview.goForward();
            }
        });

        var openMenu = function (e) {
            e.stopPropagation();
            e.preventDefault();
            wrapper.style.top = window.pageYOffset * -1 + "px";
            browser.classList.add("modalview");
            setTimeout(function () {
                browser.classList.add("animate");
                setOpenMenuAppBarColors();
            }, 25);
        }

        // Listen for the favorites button to open the favorites menu
        favButton.addEventListener("click", function (e) {
            settingsMenu.style.display = "none";
            openMenu(e);
        });

        // Listen for the settings button to open the settings menu
        settingsButton.addEventListener("click", function (e) {
            favMenu.style.display = "none";
            openMenu(e);
        });

        var closeMenu = function () {
            if (browser.className.includes("animate")) {
                var onTransitionEnd = function () {
                    browser.removeEventListener("transitionend", onTransitionEnd);
                    browser.classList.remove("modalview");
                    wrapper.style.top = "0px";
                    favMenu.style.display = "block";
                    settingsMenu.style.display = "block";
                };
                browser.addEventListener("transitionend", onTransitionEnd);
                browser.classList.remove("animate");
                setDefaultAppBarColors();
            }
        }

        container.addEventListener("click", closeMenu);

        // Listen for the clear cache button to clear the cache
        clearCacheButton.addEventListener("click", function () {
            clearCache();
            closeMenu();
        });

        // Listen for the add favorite button to save the current page to the list of favorites
        addFavButton.addEventListener("click", function () {
            favorites.set(currentUrl, { 'title': documentTitle });
            saveFavorites(favorites);
        });

        // Listen for the clear favorites button to empty the list of favorites
        clearFavButton.addEventListener("click", function () {
            favorites.clear();
            saveFavorites(favorites);
            closeMenu();
        });

        // Check if a file exists at the specified URL
        function fileExists (url) {
            var http = new XMLHttpRequest();
            try {
                http.open("HEAD", url, false);
                http.send();
                return http.status !== 404;
            }
            catch (e) {
                console.error("Unsuccessful XMLHttpRequest:", e.toString());
            }
        }

        // Save the list of favorites to file
        function saveFavorites (favorites) {
            roamingFolder.createFileAsync("favorites.json", Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (favFile) {
                var favJSON = JSON.stringify(Array.from(favorites));
                return Windows.Storage.FileIO.writeTextAsync(favFile, favJSON);
            })
            .done(function () {
                readFavorites();
            });
        }

        // Navigate to the specified URL
        function navigateTo (loc) {
            if (webview) {
                try {
                    webview.navigate(loc);
                }
                catch (e) {
                    // Auto-add a protocol for convenience
                    console.log("Unable to navigate to '" + loc + "'\nAttemping to prepend http:// to URI...");
                    loc = "http://" + loc;
                    try {
                        webview.navigate(loc);
                    }
                    catch (e) {
                        console.error(e.toString(), "\nPrepend unsuccessful", "\nUnable to navigate to", loc);
                    }
                }
            }
        }

        // Listen for a change in data
        function dataChangedHandler (e) {
            // Refresh the data
        }

        // Retrieve the list of favorites and add them to the UI
        function readFavorites() {
            roamingFolder.getFileAsync("favorites.json")
                .then(function (favFile) {
                    return Windows.Storage.FileIO.readTextAsync(favFile);
                })
                .done(function (favJSON) {
                    // Read the list of favorites from file
                    var updatedFavs = JSON.parse(favJSON);
                    var favList = document.querySelectorAll("#favMenu .favorite");
                    favorites = new Map;
                    updatedFavs.forEach(function (pair) {
                        favorites.set(pair[0], pair[1]);
                    });
                    // Clear the favorites menu
                    for (var i = 0; i < favList.length; i++) {
                        var favNode = favList[i];
                        favNode.parentNode.removeChild(favNode);
                    }
                    // Propagate the favorites menu with the new list
                    if (favorites.size > 0) {
                        var i = 1;
                        favorites.forEach(function (entry, url) {
                            var favEntry = document.createElement("a");
                            favEntry.className = "favorite";
                            favEntry.addEventListener("click", function () {
                                closeMenu();
                                navigateTo(url);
                            });
                            favEntry.textContent = entry.title;
                            var delay = 0.06 + 0.03 * i;
                            favEntry.style.transitionDelay = delay + "s";
                            document.getElementById("favorites").appendChild(favEntry);
                            var alt = document.createElement("div");
                            alt.className = "url";
                            alt.textContent = url;
                            favEntry.appendChild(alt);
                            i++;
                        });
                    }
                },
                function (e) {
                    console.error(e.toString(), "\nUnable to get favorites");
                });
        }

        // Listen for unviewable content
        function unviewableContent (e) {
            console.error("Unviewable content:", e.toString());
            if (e.mediaType == "application/pdf") {
                var uri = new Windows.Foundation.Uri(e.uri);
                Windows.System.Launcher.launchUriAsync(uri);
            }
        }

        // Listen for an unsupported URI scheme
        function unsupportedUriScheme (e) {
            console.error(e.toString(), "\nUnsupported URI scheme:");
        }

        // Listen for a permission request
        function permissionRequested (e) {
            console.log("Permission requested");
            if (e.permissionRequest.type === 'geolocation') {
                e.permissionRequest.allow();
            }
        }

        // Listen for a new window
        function newWindowRequested (e) {
            console.log("New window requested");
            e.preventDefault();
            var webview = document.getElementById('WebView');
            webview.navigate(e.uri);
        }

        // Clear the cache of temporary web data
        function clearCache () {
            var op = MSApp.clearTemporaryWebDataAsync();
            op.oncomplete = function () {
                console.log("Temporary web data cleared successfully");
                var wv = document.getElementById("WebView");
                wv.refresh();
            };
            op.onerror = function (e) { console.error(e.toString(), "\nUnable to clear web data"); };
            op.start();
        }
    });
})();