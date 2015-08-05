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
            console.error(`Unsuccessful XMLHttpRequest: ${e.toString()}`);
        }
    }

    // Navigate to the specified URL
    this.navigateTo = (loc) => {
        try {
            this.webview.navigate(loc);
        }
        catch (e) {
            // Auto-add a protocol for convenience
            console.log(`Unable to navigate to ${loc}\nAttemping to prepend http:// to URI...`);

            try {
                loc = `http://${loc}`;
                this.webview.navigate(loc);
            }
            catch (e) {
                console.error(`${e.message}\nPrepend unsuccessful\nUnable to navigate to ${loc}`);
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
    this.getFavicon = (e) => {
        // Check if there is a favicon in the root directory
        let currentUrl = e.uri;
        let protocol = currentUrl.split(":");
        if (protocol[0].slice(0, 4) !== "http") {
            return;
        }
        let host = currentUrl.match(/:\/\/([^\/]+)/);
        if (host === null) {
            return;
        }
        let ico = `${protocol[0]}://${host[1]}/favicon.ico`;
        if (fileExists(ico)) {
            console.log(`Favicon found: ${ico}`);
            this.favicon.src = ico;
        }
        else {
            console.log("Favicon not found in root. Checking the markup...");

            // Asynchronously check for a favicon in the web page markup
            let script = "Object.create(Array.from(document.getElementsByTagName('link')).find((link) => link.rel.includes('icon')) || null).ref";
            let asyncOp = this.webview.invokeScriptAsync("eval", script);

            asyncOp.oncomplete = (e) => {
                let path = e.target.result;
                console.log(`Found favicon in markup: ${path}`);
                this.favicon.src = path || "";
            };
            asyncOp.onerror = (e) => {
                console.error(e, "Unable to find favicon in markup");
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
        let domain = this.currentUrl ? this.currentUrl.match(/:\/\/([^\/]+)/)[1] : "microsoft.com";

        // Remove `www` subdomain
        let pair = domain.split(".");
        if (pair.length > 1 && pair[0] === "www") {
            domain = pair.slice(1).join(".");
        }
        let text = `I visited ${domain} in a browser built with HTML and JavaScript. Find out more here:`;
        this.navigateTo(`${path}?hashtags=${tags.join()}&text=${text}&url=${url}`);
    });

    // Listen for the Enter key in the address bar to navigate to the specified URL
    this.urlInput.addEventListener("keypress", (e) => {
        if (e.keyCode === 13) {
            this.navigateTo(urlInput.value);
        }
    });

    // Listen for focus on the address bar to auto-select the text
    // Use `setTimeout` to prevent the text from being immediately unselected
    this.urlInput.addEventListener("focus", (e) => setTimeout(() => e.target.select(), 10));

    // Listen for the loss of focus on the address bar to unselect the text
    this.urlInput.addEventListener("blur", () => getSelection().removeAllRanges());
});