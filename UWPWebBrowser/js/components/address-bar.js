browser.on("init", function () {
    "use strict";

    const LOC_CACHE = new Map;

    // Attempt a function
    function attempt(func) {
        try {
            return func();
        }
        catch (e) {
            return e;
        }
    }

    // Check if a file exists at the specified URL
    function fileExists(url) {
        return new Promise(resolve =>
            Windows.Web.Http.HttpClient()
                .getAsync(
                    Windows.Foundation.Uri(url),
                    Windows.Web.Http.HttpCompletionOption.responseHeadersRead
                )
                .done(e => resolve(e.isSuccessStatusCode), () => resolve(false))
        );
    }

    // Get the domain
    function getDomain(url, removeWWW) {
        let uriObj = Windows.Foundation.Uri(url);
        return removeWWW ? uriObj.domain : uriObj.host;
    }

    // Navigate to the specified absolute URL
    function navigate(webview, url, silent) {
        let resp = attempt(() => webview.navigate(url));
        let result = !(resp instanceof Error);

        if (!silent && !result) {
            console.error(`Unable to navigate to ${url}: ${resp.message}`);
        }
        return result;
    }

    // Show the favicon if available
    this.getFavicon = loc => {
        // Exit for cached ico location
        if (this.faviconLocs.has(loc)) {
            loc = this.faviconLocs.get(loc);
            if (loc) {
                this.favicon.src = loc;
            }
            else {
                this.hideFavicon();
            }
            return;
        }
        let host = getDomain(loc);
        let oldLoc = loc;
        let protocol = loc.split(":")[0];

        // Hide favicon when the host cannot be resolved or the protocol is not http(s)
        if (!protocol.startsWith("http") || !host) {
            this.faviconLocs.set(oldLoc, "");
            this.hideFavicon();
            return;
        }
        
        loc = `${protocol}://${host}/favicon.ico`;
        
        // Check if there is a favicon in the root directory
        fileExists(loc).then(exists => {
            if (exists) {
                console.log(`Favicon found: ${loc}`);
                this.faviconLocs.set(oldLoc, loc);
                this.favicon.src = loc;
                return;
            }
            // Asynchronously check for a favicon in the web page markup
            console.log("Favicon not found in root. Checking the markup...");
            let script = "Object(Array.from(document.getElementsByTagName('link')).find(link => link.rel.includes('icon'))).href";
            let asyncOp = this.webview.invokeScriptAsync("eval", script);

            asyncOp.oncomplete = e => {
                loc = e.target.result || "";
                this.faviconLocs.set(oldLoc, loc);
                if (loc) {
                    console.log(`Found favicon in markup: ${loc}`);
                    this.favicon.src = loc;
                }
                else {
                    this.hideFavicon();
                }
            };
            asyncOp.onerror = e => {
                console.error(`Unable to find favicon in markup: ${e.message}`);
                this.faviconLocs.set(oldLoc, "");
            };
            asyncOp.start();
        });
    };

    // Hide the favicon
    this.hideFavicon = () => void (this.favicon.src = "");

    // Navigate to the specified location
    this.navigateTo = loc => {
        loc = LOC_CACHE.get(loc) || loc;
        if (navigate(this.webview, loc, true)) {
            return;
        }
        let bingLoc = `https://www.bing.com/search?q=${encodeURIComponent(loc)}`;
        let locHTTP = `http://${loc}`;
        let locHTTPS = `https://${loc}`;

        console.log(`Unable to navigate to ${loc}\nAttemping to prepend http(s):// to URI...`);

        let uriObj = attempt(() => new Windows.Foundation.Uri(locHTTP));
        let isErr = uriObj instanceof Error;

        if (isErr || !uriObj.domain) {
            let message = isErr ? uriObj.message : "";
            console.log(`Prepend unsuccessful\nQuerying bing.com... "${loc}": ${message}`);

            LOC_CACHE.set(loc, bingLoc);
            navigate(this.webview, bingLoc);
        }
        else {
            // Check if the site supports https
            fileExists(locHTTPS).then(exists => {
                if (exists) {
                    LOC_CACHE.set(loc, locHTTPS);
                    navigate(this.webview, locHTTPS);
                }
            });

            // Get a head start on loading via http
            LOC_CACHE.set(loc, locHTTP);
            navigate(this.webview, locHTTP);
        }
    };

    // Show or hide the progress ring
    this.showProgressRing = shown => {
        this.progressRing.style.display = shown ? "inline-block" : "none";
    };

    // Update the address bar with the given text and remove focus
    this.updateAddressBar = text => {
        this.urlInput.value = text;
        this.urlInput.blur();
    };

    // Hide favicon when it fails to load
    this.favicon.addEventListener("error", () => {
        if (!this.favicon.src.startsWith("ms-appx://")) {
            this.hideFavicon();
        }
    });

    // Listen for the tweet button
    this.tweetIcon.addEventListener("click", () => {
        let domain = this.currentUrl ? getDomain(this.currentUrl, true) : "microsoft.com";
        let path = "https://twitter.com/intent/tweet";
        let tags = ["UWPWebBrowser"];
        let text = `I visited ${domain} in a browser built with HTML and JavaScript. Find out more here:`;
        let url = encodeURIComponent("https://github.com/MicrosoftEdge/UAPWebBrowser");
        this.navigateTo(`${path}?hashtags=${tags.join()}&text=${text}&url=${url}`);
    });

    // Listen for the loss of focus on the address bar to unselect the text
    this.urlInput.addEventListener("blur", () => getSelection().removeAllRanges());

    // Listen for focus on the address bar to auto-select the text
    // Use `setTimeout` to prevent the text from being immediately unselected
    this.urlInput.addEventListener("focus", e => setTimeout(() => e.target.select(), 10));

    // Listen for the Enter key in the address bar to navigate to the specified URL
    this.urlInput.addEventListener("keypress", e => {
        if (e.keyCode === 13) {
            this.navigateTo(urlInput.value);
        }
    });
});
