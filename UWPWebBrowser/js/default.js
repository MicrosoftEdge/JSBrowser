// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=392286
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var applicationData = Windows.Storage.ApplicationData.current;
    var roamingSettings = applicationData.roamingSettings;
    var roamingFolder = applicationData.roamingFolder;
    var favorites = new Map;
    var documentTitle = "";
    var currentUrl = "";
    var loading = true;
    var webview, forwardButton, backButton, stopButton, favButton, favMenu, addFavButton, settingsButton, clearCacheButton, settingsMenu, urlInput;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll().then(function completed() {
                // Refresh the data
                readFavorites();
                applicationCache.addEventListener("datachanged", dataChangedHandler);

                // Get the UI elements
                webview = document.getElementById("WebView");
                documentTitle = webview.documentTitle;
                stopButton = document.getElementById("stopButton");
                forwardButton = document.getElementById("forwardButton");
                backButton = document.getElementById("backButton");
                favButton = document.getElementById("favButton");
                addFavButton = document.getElementById("addFavButton");
                settingsButton = document.getElementById("settingsButton");
                clearCacheButton = document.getElementById("clearCacheButton");
                favMenu = document.getElementById("favMenu");
                settingsMenu = document.getElementById("settingsMenu");
                urlInput = document.getElementById("urlInput");

                // Set the initial navigation state
                forwardButton.disabled = true;
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
                    document.querySelector(".win-ring").style.display = "block";

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
                    document.querySelector(".win-ring").style.display = "none";

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
                                }
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
                
                // Listen for
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

                // Listen for the favorites button to open the favorites menu
                favButton.addEventListener("click", function () {
                    favMenu.winControl.show(this);
                });

                // Depress the favorites button when the favorites menu is open
                favMenu.addEventListener("beforeshow", function () {
                    WinJS.Utilities.addClass(favButton, "open");
                });

                // Raise the favorites button when the favorites menu is closed
                favMenu.addEventListener("beforehide", function () {
                    WinJS.Utilities.removeClass(favButton, "open");
                });

                // Depress the settings button when the settings menu is opened
                settingsMenu.addEventListener("beforeshow", function () {
                    WinJS.Utilities.addClass(settingsButton, "open");
                });

                // Raise the settings button when the settings menu is closed
                settingsMenu.addEventListener("beforehide", function () {
                    WinJS.Utilities.removeClass(settingsButton, "open");
                });

                // Listen for the settings button to open the settings menu
                settingsButton.addEventListener("click", function () {
                    settingsMenu.winControl.show(this);
                });

                // Listen for the clear cache button to clear the cache
                clearCacheButton.addEventListener("click", clearCache);

                // Listen for the add favorite button to save the current page to the list of favorites
                addFavButton.addEventListener("click", function (e) {
                    favorites.set(currentUrl, { 'title': documentTitle });
                    saveFavorites(favorites);
                });

                // Listen for the clear favorites button to empty the list of favorites
                clearFavButton.addEventListener("click", function () {
                    favorites.clear();
                    saveFavorites(favorites);
                });
            }));
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

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
    function readFavorites () {
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
                    var separatorNode = document.createElement("hr");
                    separatorNode.className = "favorite";
                    favMenu.appendChild(separatorNode);
                    var separator = new WinJS.UI.MenuCommand(separatorNode, { type: 'separator' });
                    favorites.forEach(function (entry, url) {
                        var favEntry = document.createElement("button");
                        favEntry.className = "favorite";
                        favEntry.addEventListener("click", function () {
                            navigateTo(url);
                        });
                        favMenu.appendChild(favEntry);
                        var favCommand = new WinJS.UI.MenuCommand(favEntry, { type: 'button', label: entry.title });
                        var entryLabel = favEntry.querySelector(".win-label");
                        var alt = document.createElement("div");
                        alt.className = "url";
                        alt.textContent = url;
                        entryLabel.appendChild(alt);
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

    app.start();
})();