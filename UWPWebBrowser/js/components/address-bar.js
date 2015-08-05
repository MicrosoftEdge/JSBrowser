browser.on("init", function () {
    "use strict";

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
                .done(() => resolve(true), () => resolve(false))
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
        let isErr = resp instanceof Error;

        if (!silent && isErr) {
            console.error(`${resp.message}\nUnable to navigate to ${url}`);
        }
        return !isErr;
    }

    // Navigate to the specified location
    this.navigateTo = (loc) => {
        let bingPath = `https://www.bing.com/search?q=${encodeURIComponent(loc)}`;
        let locProtocol = `https://${loc}`;

        if (navigate(this.webview, loc, true)) {
            return;
        }
        console.log(`Unable to navigate to ${loc}\nAttemping to prepend http(s):// to URI...`);

        let uriObj = attempt(() => new Windows.Foundation.Uri(locProtocol));
        let isErr = uriObj instanceof Error;

        if (isErr || !uriObj.domain) {
            let message = isErr ? (uriObj.message + "\n") : "";
            console.log(`${message}Prepend unsuccessful\nQuerying bing.com... "${loc}"`);
            navigate(this.webview, bingPath);
        }
        else {
            // Check if the site supports https
            fileExists(locProtocol).then(exists => exists && navigate(this.webview, locProtocol));

            // Get a head start on loading via http
            navigate(this.webview, `http://${loc}`);
        }
    };

    // Update the address bar with the current URL and remove focus
    this.updateAddressBar = () => {
        this.urlInput.value = this.currentUrl;
        this.urlInput.blur();
    };

    // Show or hide the progress ring
    this.showProgressRing = (shown) => void (document.querySelector(".ring").style.display = shown ? "inline-block" : "none");

    // Show the favicon if available
    this.getFavicon = (uri) => {
        // Check if there is a favicon in the root directory
        let protocol = uri.split(":")[0];
        if (protocol.slice(0, 4) !== "http") {
            return;
        }
        let host = getDomain(uri);
        if (host === null) {
            return;
        }
        let ico = `${protocol}://${host}/favicon.ico`;
        fileExists(ico).then(exists => {
            if (exists) {
                console.log(`Favicon found: ${ico}`);
                this.favicon.src = ico;
                return;
            }
            console.log("Favicon not found in root. Checking the markup...");

            // Asynchronously check for a favicon in the web page markup
            let script = "Object(Array.from(document.getElementsByTagName('link')).find((link) => link.rel.includes('icon'))).href";
            let asyncOp = this.webview.invokeScriptAsync("eval", script);

            asyncOp.oncomplete = e => {
                let path = e.target.result;
                console.log(`Found favicon in markup: ${path}`);
                this.favicon.src = path || "";
            };
            asyncOp.onerror = e => {
                console.error(`${e.message} Unable to find favicon in markup`);
            };
            asyncOp.start();
        });
    };

    // Hide the favicon
    this.hideFavicon = () => void (this.favicon.src = "");

    let tweet = document.querySelector("#tweet");

    // Listen for the tweet button
    tweet.addEventListener("click", () => {
        let path = "https://twitter.com/intent/tweet";
        let tags = ["UWPWebBrowser"];
        let url = encodeURIComponent("https://github.com/MicrosoftEdge/UAPWebBrowser");
        let domain = this.currentUrl ? getDomain(this.currentUrl, true) : "microsoft.com";
        let text = `I visited ${domain} in a browser built with HTML and JavaScript. Find out more here:`;
        this.navigateTo(`${path}?hashtags=${tags.join()}&text=${text}&url=${url}`);
    });

    // Listen for the Enter key in the address bar to navigate to the specified URL
    this.urlInput.addEventListener("keypress", e => {
        if (e.keyCode === 13) {
            this.navigateTo(urlInput.value);
        }
    });

    // Listen for focus on the address bar to auto-select the text
    // Use `setTimeout` to prevent the text from being immediately unselected
    this.urlInput.addEventListener("focus", e => setTimeout(() => e.target.select(), 10));

    // Listen for the loss of focus on the address bar to unselect the text
    this.urlInput.addEventListener("blur", () => getSelection().removeAllRanges());
});