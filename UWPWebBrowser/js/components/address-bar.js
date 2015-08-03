browser.on("init", function () {
    "use strict";

    // Navigate to the specified URL
    browser.navigateTo = function (loc) {
        try {
            this.webview.navigate(loc);
        }
        catch (e) {
            // Auto-add a protocol for convenience
            console.log("Unable to navigate to '" + loc + "'\nAttemping to prepend http:// to URI...");
            loc = "http://" + loc;
            try {
                this.webview.navigate(loc);
            }
            catch (e) {
                console.error(e.toString(), "\nPrepend unsuccessful", "\nUnable to navigate to", loc);
            }
        }
    };

    // Update the address bar with the current URL and remove focus
    browser.updateAddressBar = function () {
        this.urlInput.value = this.currentUrl;
        this.urlInput.blur();
    };

    // Show or hide the progress ring
    browser.showProgressRing = function (shown) {
        document.querySelector(".ring").style.display = shown ? "inline-block" : "none";
    };

    // Show the favicon if available
    browser.getFavicon = function (e) {
        // Check if there is a favicon in the root directory
        var currentUrl = e.uri;
        var protocol = currentUrl.split(":");
        if (protocol[0].slice(0, 4) === "http") {
            var host = currentUrl.match(/:\/\/([^\/]+)/);
            if (host !== null) {
                var ico = protocol[0] + "://" + host[1] + "/favicon.ico";
                if (fileExists(ico)) {
                    console.log("Favicon found:", ico);
                    browser.favicon.src = ico;
                }
                else {
                    // Asynchronously check for a favicon in the web page markup
                    console.log("Favicon not found in root. Checking the markup...");
                    var script = "(function () {var n = document.getElementsByTagName('link'); for (var i = 0; i < n.length; i++) { if (n[i].getAttribute('rel').includes('icon')) { return n[i].href; }}})();";
                    var asyncOp = webview.invokeScriptAsync("eval", script);
                    asyncOp.oncomplete = function (e) {
                        var path = e.target.result;
                        console.log("Found favicon in markup:", path);
                        browser.favicon.src = path;
                    };
                    asyncOp.onerror = function (e) {
                        console.error(e, "Unable to find favicon in markup");
                    }
                    asyncOp.start();
                }
            }
        }
    };

    // Hide the favicon
    browser.hideFavicon = function () {
        this.favicon.src = "";
    };

    // Listen for the Enter key in the address bar to navigate to the specified URL
    browser.urlInput.addEventListener("keypress", function (e) {
        if (e.keyCode == 13) {
            browser.navigateTo(urlInput.value);
        }
    });

    // Listen for focus on the address bar to auto-select the text
    browser.urlInput.addEventListener("focus", function (e) {
        // Workaround to prevent the text from being immediately unselected
        setTimeout(function () {
            this.select();
        }.bind(this), 10);
    });

    // Listen for the loss of focus on the address bar to unselect the text
    browser.urlInput.addEventListener("blur", function () {
        window.getSelection().removeAllRanges();
    });

    // Check if a file exists at the specified URL
    function fileExists(url) {
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
});