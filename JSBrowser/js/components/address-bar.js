browser.on("init", function () {
    "use strict";

    const LOC_CACHE = new Map;
    const URI = Windows.Foundation.Uri;
    const RE_VALIDATE_URL = /^[-:.&#+()[\]$'*;@~!,?%=\/\w]+$/;

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
                .getAsync(new URI(url), Windows.Web.Http.HttpCompletionOption.responseHeadersRead)
                .done(e => resolve(e.isSuccessStatusCode), () => resolve(false))
        );
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
        let host = new URI(loc).host;

        // Exit for cached ico location
        if (this.faviconLocs.has(host)) {
            loc = this.faviconLocs.get(host);
            if (loc) {
                this.favicon.src = loc;
            }
            else {
                this.hideFavicon();
            }
            return;
        }
        let protocol = loc.split(":")[0];

        // Hide favicon when the host cannot be resolved or the protocol is not http(s)
        if (!protocol.startsWith("http") || !host) {
            this.faviconLocs.set(host, "");
            this.hideFavicon();
            return;
        }
        
        loc = `${protocol}://${host}/favicon.ico`;
        
        // Check if there is a favicon in the root directory
        fileExists(loc).then(exists => {
            if (exists) {
                console.log(`Favicon found: ${loc}`);
                this.faviconLocs.set(host, loc);
                this.favicon.src = loc;
                return;
            }
            // Asynchronously check for a favicon in the web page markup
            console.log("Favicon not found in root. Checking the markup...");
            let asyncOp = this.webview.invokeScriptAsync("eval", `
                Object(Array.from(document.getElementsByTagName('link'))
                  .find(link => link.rel.includes('icon'))).href
            `);
            asyncOp.oncomplete = e => {
                loc = e.target.result || "";
                this.faviconLocs.set(host, loc);

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
                this.faviconLocs.set(host, "");
            };
            asyncOp.start();
        });
    };

    // Hide the favicon
    this.hideFavicon = () => {
        this.favicon.src = "";
    };

    // Navigate to the specified location
    this.navigateTo = loc => {
        loc = LOC_CACHE.get(loc) || loc;

        // Check if the input value contains illegal characters
        let isUrl = RE_VALIDATE_URL.test(loc);
        if (isUrl && navigate(this.webview, loc, true)) {
            return;
        }
        let bingLoc = `https://www.bing.com/search?q=${encodeURIComponent(loc)}`;
        let locHTTP = `http://${loc}`;
        let locHTTPS = `https://${loc}`;

        console.log(`Unable to navigate to ${loc}\nAttemping to prepend http(s):// to URI...`);

        let uri = attempt(() => new URI(locHTTP));
        let isErr = uri instanceof Error;

        if (isErr || !isUrl || !uri.domain) {
            let message = isErr ? uri.message : "";
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
    this.toggleProgressRing = state => {
        let style = this.progressRing.style;
        let isHidden = typeof state == "boolean" ? state : style.display == "none";
        style.display = isHidden ? "inline-block" : "none";
    };

    this.colorizeAddress = address => {
        let HTML = '';
        // Parse URL using an <a> element
        let a = document.createElement('a');
        a.href = address;

        // Detect HTTPS protocol
        if (a.protocol === 'https:')
            HTML += "<span class='https'>https:</span>//";
        // Display any protocol other than HTTP
        else if (a.protocol !== 'http:')
            HTML += a.protocol + "//";

        // Highlight domain in hostname
        let hostnameRegex = /(^|\.)([^.]+(?:\.[\w\d]{2,3})?\.[\w\d]{2,})$/;
        HTML += hostnameRegex.test(a.hostname)
            ? a.hostname.replace(hostnameRegex, "$1<span class='domain'>$2</span>")
            : "<span class='domain'>" + a.hostname + "</span>";

        // Add port if it's a valid number
        if (a.port.length > 0 && !isNaN(a.port))
            HTML += ':' + a.port;

        // Remove last / from pathname if original address doesn't have it either
        let pathname = a.pathname;
        if (!/\/$/.test(address))
            pathname = pathname.replace(/\/$/, '');
        HTML += pathname+a.search+a.hash;
        return HTML;
    }

    // Update the address bar with the given text and remove focus
    this.updateAddressBar = text => {
        this.urlInput.value = text;
        this.urlDisplay.innerHTML = this.colorizeAddress(text);
        this.urlInput.blur();
    };

    // Hide the favicon when it fails to load
    this.favicon.addEventListener("error", () => {
        if (!this.favicon.src.startsWith("ms-appx://")) {
            this.hideFavicon();
        }
    });

    // Listen for the tweet button
    this.tweetIcon.addEventListener("click", () => {
        let domain = (this.currentUrl && new URI(this.currentUrl).host) || "microsoft.com";
        let path = "https://twitter.com/intent/tweet";
        let tags = ["Windows", "UWP"].map(encodeURIComponent);
        let text = encodeURIComponent(`I visited ${domain} in a browser built with HTML and JavaScript \u{1F332}. Find out more here:`);
        let url = encodeURIComponent("http://bit.ly/1IDpBVA");
        this.navigateTo(`${path}?hashtags=${tags.join()}&text=${text}&url=${url}`);
    });

    // Listen for the loss of focus on the address bar to unselect the text
    this.urlInput.addEventListener("blur", () => getSelection().removeAllRanges());

    // Listen for focus on the address bar to auto-select the text
    // Use `setImmediate` to prevent the text from being immediately unselected
    this.urlInput.addEventListener("focus", e => setImmediate(() => e.target.select()));

    // Listen for the Enter key in the address bar to navigate to the specified URL
    this.urlInput.addEventListener("keypress", e => {
        if (e.keyCode === 13) {
            this.navigateTo(urlInput.value.trim());
        }
    });
});
