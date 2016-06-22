#&nbsp;![Logo](https://cloud.githubusercontent.com/assets/7266075/9254929/15448684-419b-11e5-8110-41757c572fe8.png) JavaScript Browser
A web browser built with JavaScript as a Windows app.<br />
http://microsoftedge.github.io/JSBrowser/

[![badge_windowsstore](https://cloud.githubusercontent.com/assets/7266075/9445327/6a0e1d9e-4a40-11e5-80e9-99b21af35c35.png)](https://www.microsoft.com/store/apps/9NBLGGH1Z7VX)

![JavaScript Browser](https://cloud.githubusercontent.com/assets/3200580/10122615/99850d4a-651f-11e5-8357-e83576384010.png)

This project is a tutorial demonstrating the capabilities of the web platform on Windows 10. The browser is a sample app built around the HTML [WebView control](https://msdn.microsoft.com/en-us/library/windows/apps/dn301831.aspx), using primarily JavaScript to light up the user interface. Built using [Visual Studio 2015](https://www.visualstudio.com/), this is a JavaScript [Universal Windows Platform](https://msdn.microsoft.com/library/windows/apps/dn894631.aspx) (UWP) app.

In addition to JavaScript, HTML and CSS are the other core programming languages used. Some C++ code is also included to enable supplemental features, but is not required to create a simple browser.

Additionally, we’re taking advantage of the new [ECMAScript 2015](http://www.ecma-international.org/ecma-262/6.0/) (ES2015) support in Chakra, the JavaScript engine behind Microsoft Edge and the WebView control. ES2015 allows us to remove much of the scaffolding and boilerplate code, simplifying our implementation significantly. The following ES2015 features were used in the creation of this app: [Array.from()](http://www.ecma-international.org/ecma-262/6.0/#sec-array.from), [Array.prototype.find()](http://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.find), [arrow functions](http://dev.modern.ie/platform/status/arrowfunction/), [method properties](http://dev.modern.ie/platform/status/es6objectliteralenhancements/), [const](http://dev.modern.ie/platform/status/blockbindingsletconstfunction/), [for-of](http://dev.modern.ie/platform/status/jsiteratorsietheforoffeature/), [let](http://dev.modern.ie/platform/status/blockbindingsletconstfunction/), [Map](http://dev.modern.ie/platform/status/map/), [Object.assign()](http://dev.modern.ie/platform/status/objectbuiltinses6/), [Promises](http://dev.modern.ie/platform/status/promiseses6/), [property shorthands](http://dev.modern.ie/platform/status/es6objectliteralenhancements/), [Proxies](http://dev.modern.ie/platform/status/proxieses6/), [spread operator](http://dev.modern.ie/platform/status/spreades6/), [String.prototype.includes()](http://dev.modern.ie/platform/status/stringbuiltinses6/), [String.prototype.startsWith()](http://dev.modern.ie/platform/status/stringbuiltinses6/), [Symbols](http://dev.modern.ie/platform/status/symbols/), [template strings](http://dev.modern.ie/platform/status/templatestringses6/), and [Unicode code point escapes](http://www.ecma-international.org/ecma-262/6.0/#sec-literals-string-literals).

## User interface
The user interface consists of ten components:
* Title bar
* Back button
* Forward button
* Refresh button
* [Favicon](https://en.wikipedia.org/wiki/Favicon)
* Address bar
* Share on Twitter button
* Favorites button and menu
* Settings button and menu
* WebView control

![Favorites](https://cloud.githubusercontent.com/assets/7266075/9344233/ef5711f6-45bb-11e5-85dd-5ab5ff7d6ee1.png)

## Additional functionality
There are several additional features implemented to make the browsing experience more pleasant:
* Keyboard shortcuts - press F11 to toggle fullscreen mode, ESC to exit fullscreen mode, or Ctrl + L to select the address bar
* [CSS transitions](http://www.w3.org/TR/css3-transitions/) for animating the menus
* Cache management
* Favorites management
* URL input analysis — “bing.com” navigates to http(s)://bing.com, “seahawks” searches Bing
* Auto-de/select the address bar on blur/focus
* Responsive design

## Harnessing the WebView control
```html
<div class="navbar">
  <!-- ... -->
</div>
<x-ms-webview id="WebView"></x-ms-webview>
```

[Introduced](http://blogs.windows.com/buildingapps/2013/07/17/whats-new-in-webview-in-windows-8-1/) for JavaScript apps in Windows 8.1, the WebView control—sometimes referred to by its tag name, [x-ms-webview](https://msdn.microsoft.com/en-us/library/windows/apps/dn301831.aspx)—allows you to host web content in your Windows app. Available in both HTML and [XAML](https://en.wikipedia.org/wiki/Extensible_Application_Markup_Language), the x-ms-webview comes with a powerful set of APIs, which overcomes [several of the limitations](http://blogs.windows.com/buildingapps/2013/10/01/blending-apps-and-sites-with-the-html-x-ms-webview/) that encumber an iframe, such as framebusting sites and document loading events. Additionally, the x-ms-webview provides new functionality that is not possible with an iframe, such as better access to local content and the ability to take screenshots.

When you use the WebView control, you get the same web platform that powers Microsoft Edge.

![WebView flowchart](https://cloud.githubusercontent.com/assets/7266075/9342671/036d5e70-45b2-11e5-8f01-005dac0f644f.png)

## Developing the browser
We will be using fifteen of the x-ms-webview APIs. All but two of these members handle the page navigation in some capacity. Let’s see how we can hook into these APIs to create each UI component.

### Hooking up the back and forward buttons
When you invoke a back button, the browser returns to an earlier page in the browser history, if available. Similarly, when you invoke a forward button, the browser returns to a later page in the browser history, if available. In order to implement this logic, we use the [goBack()](https://msdn.microsoft.com/en-us/library/windows/apps/dn301838.aspx) and [goForward()](https://msdn.microsoft.com/en-us/library/windows/apps/dn301839.aspx) methods, respectively. These functions will automatically navigate to the correct page in the navigation stack.

After every page navigation, we will also update the current state to stop the user from navigating further when they reach either end of the navigation stack. This will disable the back or forward buttons when the [canGoBack](https://msdn.microsoft.com/en-us/library/windows/apps/dn301833.aspx) property or the [canGoForward](https://msdn.microsoft.com/en-us/library/windows/apps/dn301834.aspx) property resolves `false`, respectively.

```js
// Update the navigation state
this.updateNavState = () => {
  this.backButton.disabled = !this.webview.canGoBack;
  this.forwardButton.disabled = !this.webview.canGoForward;
};

// Listen for the back button to navigate backwards
this.backButton.addEventListener("click", () => this.webview.goBack());

// Listen for the forward button to navigate forwards
this.forwardButton.addEventListener("click", () => this.webview.goForward());
```

###Hooking up the refresh and stop buttons

The refresh and stop buttons are slightly different than the rest of the navbar components in that they take up the same space in the UI. When a page is loading, clicking the button will stop the navigation, hide the progress ring, and display a refresh icon. Conversely, when a page is stagnant, clicking the button will refresh the page and (in another part of the code) display a stop icon. We’ll use the [refresh()](https://msdn.microsoft.com/en-us/library/windows/apps/dn301846.aspx) and [stop()](https://msdn.microsoft.com/en-us/library/windows/apps/dn301848.aspx) methods based on the present conditions.

```js
// Listen for the stop/refresh button to stop navigation/refresh the page
this.stopButton.addEventListener("click", () => {
  if (this.loading) {
    this.webview.stop();
    this.showProgressRing(false);
    this.showRefresh();
  }
  else {
    this.webview.refresh();
  }
});
```

### Hooking up the address bar

At a very high level, implementing the address bar appears quite simple. When a URL is entered in the textbox, pressing Enter will call the [navigate()](https://msdn.microsoft.com/en-us/library/windows/apps/dn301842.aspx) method using the address bar input value as its parameter.

However, today’s modern browsers have increased the amount of functionality for added convenience to the user. This adds some complexity to the implementation, depending on the number of scenarios you intend on accommodating.

```js
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

// Navigate to the specified absolute URL
function navigate(webview, url, silent) {
  let resp = attempt(() => webview.navigate(url));
  // ...
}

// Navigate to the specified location
this.navigateTo = loc => {
  // ...
  // Check if the input value contains illegal characters
  let isUrl = RE_VALIDATE_URL.test(loc);
  if (isUrl && navigate(this.webview, loc, true)) {
    return;
  }
  // ... Fallback logic (e.g. prepending http(s) to the URL, querying Bing.com, etc.)
};

// Listen for the Enter key in the address bar to navigate to the specified URL
this.urlInput.addEventListener("keypress", e => {
  if (e.keyCode === 13) {
    this.navigateTo(urlInput.value);
  }
});
```

Here are some example scenarios to consider. Say the value "microsoft.com" was entered into the address bar. The URL is not entirely complete. Passing that value into the `navigate()` method would end unsuccessfully. The browser must acknowledge that the URL is incomplete and determine whether *http* or *https* is the correct protocol to prepend. Furthermore, a URL may not have been intended as a URL at all. Say the value “seahawks” was entered into the address bar. Many browsers have their address bar double as a search box. The browser must establish that the value is not a URL, and fall back to querying a search engine for that value.

### Displaying the favicon
Acquiring a [favicon](https://en.wikipedia.org/wiki/Favicon) can be tricky, as there are several ways in which it can be displayed. The easiest route would be to check the root of the website for a file named "favicon.ico". Though, some sites are actually in the subdomain and may have a different favicon. For example, the favicon for “microsoft.com” is different than the favicon for “windows.microsoft.com”. In order to minimize the ambiguity, another route would be to check the markup of the page for a link tag within the document head with a “rel” attribute of “icon” or “shortcut icon”. We use the [invokeScriptAsync()](https://msdn.microsoft.com/en-us/library/windows/apps/dn301841.aspx) method to inject script into the WebView control, which will return a string if successful. Our script will search for all elements in the hosted page with a link tag, check if the ref attribute contains the word “icon”, and, if there is a match, return the value of the “href” attribute back to the app.

```js
// Check if a file exists at the specified URL
function fileExists(url) {
  return new Promise(resolve =>
    Windows.Web.Http.HttpClient()
      .getAsync(new URI(url), Windows.Web.Http.HttpCompletionOption.responseHeadersRead)
      .done(e => resolve(e.isSuccessStatusCode), () => resolve(false))
  );
}

// Show the favicon if available
this.getFavicon = loc => {
  let host = new URI(loc).host;

  // Exit for cached ico location
  // ...

  let protocol = loc.split(":")[0];

  // Hide favicon when the host cannot be resolved or the protocol is not http(s)
  // ...

  loc = `${protocol}://${host}/favicon.ico`;

  // Check if there is a favicon in the root directory
  fileExists(loc).then(exists => {
    if (exists) {
      console.log(`Favicon found: ${loc}`);
      this.favicon.src = loc;
      return;
    }
    // Asynchronously check for a favicon in the web page markup
    console.log("Favicon not found in root. Checking the markup...");
    let script = "Object(Array.from(document.getElementsByTagName('link')).find(link => link.rel.includes('icon'))).href";
    let asyncOp = this.webview.invokeScriptAsync("eval", script);

    asyncOp.oncomplete = e => {
      loc = e.target.result || "";

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
    };
    asyncOp.start();
  });
};
```

As mentioned earlier, we are making use of the new ES2015 specification throughout our code. You may have noticed the use of [arrow notation](http://dev.modern.ie/platform/status/arrowfunction/) in many of the previous code samples, among other new JavaScript APIs. The injected script is a great example of the code improvement exhibited by implementing ES2015 features.

```javascript
// Before (ES < 6):
"(function () {var n = document.getElementsByTagName('link'); for (var i = 0; i < n.length; i++) { if (n[i].rel.indexOf('icon') > -1) { return n[i].href; }}})();"

// After (ES6):
"Object(Array.from(document.getElementsByTagName('link')).find(link => link.rel.includes('icon'))).href"
```

### Adding keyboard shortcuts
Unlike the features we have already covered, implementing keyboard shortcuts requires a small amount of C++ or C# code to create a Windows Runtime (WinRT) component.

![Keyboard shortcuts flowchart](https://cloud.githubusercontent.com/assets/7266075/9342811/d9948d7a-45b2-11e5-877c-7a4c5e546275.png)

In order to recognize the defined hot keys for particular actions, such as Ctrl + L to select the address bar and F11 to toggle full screen mode, we need to inject script into the WebView control. This is done using the [invokeScriptAsync()](https://msdn.microsoft.com/en-us/library/windows/apps/dn301841.aspx) method we discussed earlier. However, we need some way to communicate the key codes back to the app layer.

With the [addWebAllowedObject()](https://msdn.microsoft.com/en-us/library/windows/apps/dn301831.aspx) method, we can expose a method for the injected script to pass the hot keys back to our app logic in JavaScript. Although, in Windows 10, the WebView control is off-thread. We need to create a dispatcher, which will marshal the event through to the UI thread so that the app layer can receive the notification.

```c++
KeyHandler::KeyHandler()
{
	// Must run on App UI thread
	m_dispatcher = Windows::UI::Core::CoreWindow::GetForCurrentThread()->Dispatcher;
}

void KeyHandler::setKeyCombination(int keyPress)
{
	m_dispatcher->RunAsync(
		CoreDispatcherPriority::Normal,
		ref new DispatchedHandler([this, keyPress]
	{
		NotifyAppEvent(keyPress);
	}));
}
```

```js
// Create the C++ Windows Runtime Component
let winRTObject = new NativeListener.KeyHandler();

// Listen for an app notification from the WinRT object
winRTObject.onnotifyappevent = e => this.handleShortcuts(e.target);

// Expose the native WinRT object on the page's global object
this.webview.addWebAllowedObject("NotifyApp", winRTObject);

// ...

// Inject fullscreen mode hot key listener into the WebView with every page load
this.webview.addEventListener("MSWebViewDOMContentLoaded", () => {
    let asyncOp = this.webview.invokeScriptAsync("eval", `
        addEventListener("keydown", e => {
            let k = e.keyCode;
            if (k === ${this.KEYS.ESC} || k === ${this.KEYS.F11} || (e.ctrlKey && k === ${this.KEYS.L})) {
                NotifyApp.setKeyCombination(k);
            }
        });
    `);
    asyncOp.onerror = e => console.error(`Unable to listen for fullscreen hot keys: ${e.message}`);
    asyncOp.start();
});
```

## Customizing the browser
Now that we have incorporated the key WebView APIs, let’s explore how we can customize and polish our user interface.

### Branding the title bar
Leveraging [Windows Runtime](https://msdn.microsoft.com/en-us/library/windows/apps/br211377.aspx) APIs, we can use the [ApplicationView.TitleBar](https://msdn.microsoft.com/en-us/library/windows/apps/windows.ui.viewmanagement.applicationview.aspx) property to modify the color palette for all components in the app title bar. In our browser, we modify the colors on app load to match the background color of the navbar. We also modify the colors when either of the menus are open to match the background color of the menu. Each color must be defined as an object of [RGBA](https://en.wikipedia.org/wiki/RGBA_color_space) properties. For convenience, we created a helper function to generate the correct format from a hexadecimal string.

```js
//// browser.js
// Use a proxy to workaround a WinRT issue with Object.assign
this.titleBar = new Proxy(Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar, {
  "get": (target, key) => target[key],
  "set": (target, key, value) => (target[key] = value, true)
});

//// title-bar.js
// Set your default colors
const BRAND = hexStrToRGBA("#3B3B3B");
const GRAY = hexStrToRGBA("#666");
const WHITE = hexStrToRGBA("#FFF");

// Set the default title bar colors
this.setDefaultAppBarColors = () => {
  Object.assign(this.titleBar, {
    "foregroundColor": BRAND,
    "backgroundColor": BRAND,

    "buttonForegroundColor": WHITE,
    "buttonBackgroundColor": BRAND,

    "buttonHoverForegroundColor": WHITE,
    "buttonHoverBackgroundColor": GRAY,

    "buttonPressedForegroundColor": BRAND,
    "buttonPressedBackgroundColor": WHITE,

    "inactiveForegroundColor": BRAND,
    "inactiveBackgroundColor": BRAND,

    "buttonInactiveForegroundColor": GRAY,
    "buttonInactiveBackgroundColor": BRAND,

    "buttonInactiveHoverForegroundColor": WHITE,
    "buttonInactiveHoverBackgroundColor": BRAND,

    "buttonPressedForegroundColor": BRAND,
    "buttonPressedBackgroundColor": BRAND
  });
};
```

### Other functionality
The progress indicator, as well as the settings and favorites menus, leverage [CSS transitions](http://www.w3.org/TR/css3-transitions/) for animation. With the former menu, the temporary web data is cleared using the [clearTemporaryWebDataAsync()](https://msdn.microsoft.com/en-us/library/windows/apps/dn764996.aspx) method. With the latter menu, the list of favorites is stored on a [JSON](https://en.wikipedia.org/wiki/JSON) file in the root folder of the [roaming app data store](https://msdn.microsoft.com/en-us/library/windows/apps/windows.storage.applicationdata.roamingfolder.aspx).

## Citations
The JSBrowser logo is based on [trees by Nicholas Menghini](https://thenounproject.com/term/trees/65621/) from the Noun Project.

## Code of Conduct
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
