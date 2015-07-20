// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=392286
(function () {
    "use strict";

    // Windows Web App 
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var applicationData = Windows.Storage.ApplicationData.current;
    var roamingSettings = applicationData.roamingSettings;
    var roamingFolder = applicationData.roamingFolder;
    var favorites = [];
    var keys = [];
    var webview, forwardButton, backButton, stopButton, favButton, favMenu, favContainer, addFavButton, settingsButton, clearCacheButton, favList, favModal, settingsModal, oldclass;
    var documentTitle = "";
    var currentUrl = "";

    function fileExists (url) {
        var http = new XMLHttpRequest();
        try {
            http.open("HEAD", url, false);
            http.send();
            return http.status !== 404;
        }
        catch (e) {
            return false;
        }
    }

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
                applicationCache.addEventListener("datachanged", dataChangedHandler);

                readFavorites();
                console.log(document.getElementById("navbar").clientHeight);
                webview = document.getElementById("WebView");

                documentTitle = webview.documentTitle;
                var loading = true;

                // Set up the modals (favorites and settings)
                favModal = document.getElementById("favorites");
                var favCloseButton = document.getElementById("modalFavClose");
                oldclass = favModal.className;

                settingsModal = document.getElementById("settings");
                var settingsCloseButton = document.getElementById("modalSettingsClose");

                // Get button elements
                stopButton = document.getElementById("stopButton");
                forwardButton = document.getElementById("forwardButton");
                backButton = document.getElementById("backButton");
                favButton = document.getElementById("favButton");
                addFavButton = document.getElementById("addFavButton");
                settingsButton = document.getElementById("settingsButton");
                clearCacheButton = document.getElementById("clearCacheButton");
                favList = document.getElementById("favoritesList");
                favContainer = document.getElementById("favContainer");
                favMenu = document.getElementById("favMenu");

                var urlInput = document.getElementById("urlInput");

                // Set initial nav button state
                forwardButton.disabled = true;
                backButton.disabled = true;

                webview.addEventListener("MSWebViewNavigationStarting", function (e) {
                    loading = true;
                    urlInput.blur();

                    // Hide favicon
                    document.querySelector("#favicon").src = "";

                    // Show progress ring
                    document.querySelector(".win-ring").style.display = "block";

                    stopButton.className = "navButton stopButton";
                    stopButton.innerHTML = "<span class=\"buttonLabel\">Stop</span>";
                    urlInput.value = e.uri;
                    currentUrl = e.uri;
                    console.log("This is the current URI: " + currentUrl);
                    var protocol = currentUrl.split(":");
                    if (protocol[0] === "ms-appx-web") {
                        var communicationWinRT = new ToastWinRT.ToastClass();
                        var a = communicationWinRT.getValue();
                        webview.addWebAllowedObject("CommunicatorWinRT", communicationWinRT);
                    }
                }, false);

                webview.addEventListener("MSWebViewNavigationCompleted", function (e) {
                    loading = false;

                    // Hide progress ring
                    document.querySelector(".win-ring").style.display = "none";

                    // Check to ensure the protocol is either http or https
                    var currentUrl = e.uri;
                    var protocol = currentUrl.split(":");
                    if (protocol[0].slice(0, 4) === "http") {
                        var host = currentUrl.match(/:\/\/([^\/]+)/);
                        if (host !== null) {
                            var favicon = protocol[0] + "://" + host[1] + "/favicon.ico";
                            console.log(favicon);
                            if (fileExists(favicon)) {
                                document.querySelector("#favicon").src = favicon;
                            }
                        }
                    }

                    documentTitle = webview.documentTitle;
                    stopButton.className = "navButton refreshButton";
                    stopButton.innerHTML = "<span class=\"buttonLabel\">Refresh</span>";
                    backButton.disabled = !webview.canGoBack;
                    forwardButton.disabled = !webview.canGoForward;
                }, false);
                //New Events!
                webview.addEventListener("MSWebViewUnviewableContentIdentified", unviewableContent, false);
                webview.addEventListener("MSWebViewUnsupportedUriSchemeIdentified", unsupportedUriScheme, false);
                webview.addEventListener("MSWebViewNewWindowRequested", newWindowRequested, false);
                webview.addEventListener("MSWebViewPermissionRequested", permissionRequested, false);

                stopButton.addEventListener("click", function () {
                    if (loading) {
                        webview.stop();
                    } else {
                        webview.refresh();
                    }
                });

                urlInput.addEventListener("keypress", function (e) {
                    if (e.keyCode == 13) {
                        navigateTo(urlInput.value);
                    }
                });

                urlInput.addEventListener("focus", function (e) {
                    // Workaround to circumvent the text from being unselected
                    setTimeout(function () {
                        this.select();
                    }.bind(this), 10);
                });

                urlInput.addEventListener("blur", function () {
                    window.getSelection().removeAllRanges();
                });

                backButton.addEventListener("click", function () {
                    if (webview.canGoBack) {
                        webview.goBack();
                    }
                });

                forwardButton.addEventListener("click", function () {
                    if (webview.canGoForward) {
                        webview.goForward();
                    }
                });

                favButton.addEventListener("click", function () {
                    favModal.className += " modal-show";
                });

                favCloseButton.addEventListener("click", function () {
                    favModal.className = oldclass;
                });

                settingsButton.addEventListener("click", function () {
                    settingsModal.className += " modal-show";
                });

                settingsCloseButton.addEventListener("click", function () {
                    settingsModal.className = oldclass;
                });

                addFavButton.addEventListener("click", function () {
                    favorites.push({ name: documentTitle, url: currentUrl });
                    roamingFolder.createFileAsync("favorites.json", Windows.Storage.CreationCollisionOption.replaceExisting)
                        .then(function (favFile) {
                            var favJSON = JSON.stringify(favorites);
                            return Windows.Storage.FileIO.writeTextAsync(favFile, favJSON);
                        }).done(function () {
                            //console.log(favorites);
                            readFavorites();

                        });
                });

                window.addEventListener("keydown", keysPressed);
                window.addEventListener("keyup", keysReleased);

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

    function navigateTo(loc) {
        if (webview) {
            try {
                console.log("navigating to: " + loc);
                webview.navigate(loc);
            }
            catch (e) {
                try {
                    webview.navigate('http://' + loc);
                }
                catch (e) {
                    return false;
                }
                console.log("appended http");
            }
        }
    }

    function dataChangedHandler(event) {
        //Refresh data
    }

    function readFavorites() {
        roamingFolder.getFileAsync("favorites.json")
            .then(function (favFile) {
                return Windows.Storage.FileIO.readTextAsync(favFile);
            }).done(function (favJSON) {
                var updatedFavs = JSON.parse(favJSON);
                favorites = updatedFavs;
                console.log(updatedFavs);
                while (favList.firstChild) {
                    favList.removeChild(favList.firstChild);
                }
                favorites.forEach(function (entry) {
                    var favEntry = document.createElement("li");
                    favEntry.innerHTML = entry.name + " | " + entry.url;
                    favEntry.addEventListener("click", function () {
                        navigateTo(entry.url);
                        favModal.className = oldclass;
                    }, false);
                    favList.appendChild(favEntry);
                });
            }, function () {
                console.log("error");
            });
    }

    function keysPressed(e) {
        keys[e.keyCode] = true;
        if (keys[17] && keys[76]) {
            var urlInput = document.getElementById("urlInput");
            urlInput.select();
            e.preventDefault();
            keys = [];
        }
    }

    function keysReleased(e) {
        keys[e.keyCode] = false;
    }

    function unviewableContent(e) {
        console.log("unviewableContent");
        console.log(e.toString());
        if (e.mediaType == "application/pdf") {
            var uri = new Windows.Foundation.Uri(e.uri);
            Windows.System.Launcher.launchUriAsync(uri);

        }
    }

    function unsupportedUriScheme(e) {
        console.log("unsupportedUriScheme");
        console.log(e.toString());
    }

    function permissionRequested(e) {
        console.log("permissionRequested");
        console.log(e.toString());
        if (e.permissionRequest.type === 'geolocation') {
            e.permissionRequest.allow();
        }
    }

    function newWindowRequested(e) {
        console.log("newWindowRequested");
        console.log(e.toString());
        e.preventDefault();
        var webview = document.getElementById('WebView');
        webview.navigate(e.uri);
    }

    function clearCache() {
        console.log("Clear Cache called");
        var op = MSApp.clearTemporaryWebDataAsync();
        op.oncomplete = function () {
            console.log("Temporary web data cleared successfully");
            var wv = document.getElementById("myWebView");
            wv.refresh();
        };
        op.onerror = function () { console.log("A failure occurred in clearing the temporary web data") };
        op.start();
    }

    app.start();
})();