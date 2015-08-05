browser.on("init", function () {
    "use strict";

    // Check if a file exists at the specified URL
    function fileExists(url) {
        let http = new XMLHttpRequest;
        try {
            http.open("HEAD", url, false);
            http.send();
            return http.status !== 404;
        }
        catch (e) {
            console.error(`Unsuccessful XMLHttpRequest: ${e.message}`);
        }
    }

    // Get the domain
    function getDomain(url, removeWWW) {
        let uri = new Windows.Foundation.Uri(url);
        return removeWWW ? uri.domain : uri.host;
    }

    // Attempt a function
    function attempt(func) {
        try {
            return func();
        }
        catch (e) {
            return e;
        }
    }

    // Navigate to the specified URL
    this.navigateTo = (loc) => {
        let result = attempt(() => this.webview.navigate(loc));
        if (!(result instanceof Error)) {
            return;
        }

        console.log(`Unable to navigate to ${loc}\nAttemping to prepend http:// to URI...`);
        let locProtocol = `https://${loc}`;
        result = attempt(() => new Windows.Foundation.Uri(locProtocol));

        if (result instanceof Error || !result.domain) {
            console.log(`${result.message}\nPrepend unsuccessful\nQuerying bing.com... "${loc}"`);
            let bingPath = `https://www.bing.com/search?q=${encodeURIComponent(loc)}`;

            result = attempt(() => this.webview.navigate(bingPath));
            if (result instanceof Error) {
                console.error(`${result.message}\nUnable to navigate to ${bingPath}`);
            }
        }
        else {
            // Check if the site supports https
            Windows.Web.Http.HttpClient().getAsync(result, Windows.Web.Http.HttpCompletionOption.responseHeadersRead).done(
                () => {
                    // The site supports https, navigate using that protocol
                    result = attempt(() => this.webview.navigate(locProtocol));
                    if (result instanceof Error) {
                        console.error(`${result.message}\nUnable to navigate to ${locProtocol}`);
                    }
                }
            );
            // Get a head start on loading via http
            result = attempt(() => this.webview.navigate(`http://${loc}`));
            if (result instanceof Error) {
                console.error(`${result.message}\nUnable to navigate to http://${loc}`);
            }
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
        let currentUrl = uri;
        let protocol = currentUrl.split(":");
        if (protocol[0].slice(0, 4) !== "http") {
            return;
        }
        let host = getDomain(currentUrl);
        if (host === null) {
            return;
        }
        let ico = `${protocol[0]}://${host}/favicon.ico`;
        if (fileExists(ico)) {
            console.log(`Favicon found: ${ico}`);
            this.favicon.src = ico;
        }
        else {
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
        }
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