browser.on("init", function () {
    "use strict";

    const EMPTY_FAVICON = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const LOC_CACHE = new Map;
    const RE_VALIDATE_URL = /^[-:.&#+()[\]$'*;@~!,?%=\/\w]+$/;
    const URI = Windows.Foundation.Uri;

    let faviconFallback = [];

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
        // Asynchronously check for a favicon in the web page markup
        let asyncOp = this.webview.invokeScriptAsync("eval", `
            JSON.stringify(Array.from(document.getElementsByTagName('link'))
                .filter(link => link.rel.includes('icon'))
                .map(link => link.href))
        `);
        asyncOp.oncomplete = e => {
            // Parse result add fallbacks
            faviconFallback = JSON.parse(e.target.result);

            let protocol = loc.split(":")[0];
            if (protocol.startsWith("http") || !host) {
                loc = `${protocol}://${host}/favicon.ico`;
                faviconFallback.push(loc);
            }

            faviconFallback.push(EMPTY_FAVICON);
            this.setFavicon(faviconFallback.shift());
        };
        asyncOp.onerror = e => {
            console.error(`Unable to find favicon in markup: ${e.message}`);
            faviconFallback = [];
            this.setFavicon(EMPTY_FAVICON);
        };
        asyncOp.start();
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

    // Set the favicon to a specified URL
    this.setFavicon = url => {
        this.favicon.src = url;
    };

    // Show or hide the progress ring
    this.toggleProgressRing = state => {
        let style = this.progressRing.style;
        let isHidden = typeof state == "boolean" ? state : style.display == "none";
        style.display = isHidden ? "inline-block" : "none";
    };

    this.colorizeAddress = address => {
        let HTML = '';
        // Parse URL
        let a = new URI(address);

        // Detect HTTPS protocol
        if (a.schemeName === 'https')
            HTML += "<span class='https'>https:</span>//";
        // Display any protocol other than HTTP
        else if (a.schemeName !== 'http')
            HTML += a.schemeName + "://";

        // Add Username & password if applicable
        if (a.userName)
            HTML += "<span class='login'>"+a.userName + (a.password ? ":"+a.password : '') + "</span>@";

        // Highlight domain in hostname
        let hostnameRegex = /(^|\.)([^.]+(?:\.[\w\d]{2,3})?\.[\w\d]{2,})$/;
        HTML += hostnameRegex.test(a.host)
            ? a.host.replace(hostnameRegex, "$1<span class='domain'>$2</span>")
            : "<span class='domain'>" + a.host + "</span>";

        // Add port if it's a valid number
        if (a.port.length > 0 && !isNaN(a.port))
            HTML += ':' + a.port;

        // Remove last / from pathname if original address doesn't have it either
        let pathname = a.path;
        if (!address.endsWith('/'))
            pathname = pathname.replace(/\/$/, '');
        HTML += pathname+a.query+a.fragment;
        return HTML;
    }

    // Remove HTTP protocol from URI
    this.removeHTTPFromURI = uri => {
        return uri.replace(/^http:\/\//, '');
    }

    // Update the address bar with the given text and remove focus
    this.updateAddressBar = text => {
        this.urlInput.value = this.removeHTTPFromURI(text);
        this.urlDisplay.innerHTML = this.colorizeAddress(text);
        this.urlInput.blur();
    };

    // Use the fallback list if a favicon fails to load, otherwise hide the favicon
    this.favicon.addEventListener("error", () => {
        if (!this.favicon.src.startsWith("ms-appx://")) {
            if (faviconFallback.length) {
                this.setFavicon(faviconFallback.shift());
            }
            else {
                this.hideFavicon();
            }
        }
    });

    // Listen for a successful favicon load
    this.favicon.addEventListener("load", e => {
        faviconFallback.length = 0;
        this.faviconLocs.set(new URI(this.currentUrl).host, e.target.src);
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
    this.urlInput.addEventListener("keyup", e => {
        if (e.keyCode === 13) {
            this.navigateTo(urlInput.value.trim());
        }
    });
});
