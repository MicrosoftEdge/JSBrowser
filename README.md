#&nbsp;![Logo](https://cloud.githubusercontent.com/assets/7266075/9254929/15448684-419b-11e5-8110-41757c572fe8.png) JavaScript Browser 
A web browser built with JavaScript as a Windows app.

![JavaScript Browser](https://cloud.githubusercontent.com/assets/7266075/9255223/bb56d1b6-419c-11e5-8498-5c4f40f52bec.png)

This project is a proof-of-concept demonstrating the capabilities of the web platform on Windows 10. The browser is built around the HTML [WebView control](https://msdn.microsoft.com/en-us/library/windows/apps/dn301831.aspx), using primarily JavaScript to light up the user interface. Built using [Visual Studio 2015](https://www.visualstudio.com/), this is a JavaScript [Universal Windows Platform](https://msdn.microsoft.com/library/windows/apps/dn894631.aspx) (UWP) app.

In addition to JavaScript, HTML and CSS are the other core programming languages used. Some C++ code is also included to enable additional features, but is not required to create a simple browser.

Additionally, we will be taking advantage of the new [ECMAScript 2015](http://www.ecma-international.org/ecma-262/6.0/index.html) (ES2015) support in Chakra, the JavaScript engine behind Microsoft Edge and the WebView control. ES2015 allows us to remove much of the scaffolding and boilerplate code, simplifying our implementation significantly. The following ES2015 features were used in the creation of this app: Array.from(), Array.prototype.find(), [arrow functions](http://dev.modern.ie/platform/status/arrowfunction/), [method properties](http://dev.modern.ie/platform/status/es6objectliteralenhancements/), [const](http://dev.modern.ie/platform/status/blockbindingsletconstfunction/), [for-of](http://dev.modern.ie/platform/status/jsiteratorsietheforoffeature/), [let](http://dev.modern.ie/platform/status/blockbindingsletconstfunction/), [Map](http://dev.modern.ie/platform/status/map/), [Object.assign()](http://dev.modern.ie/platform/status/objectbuiltinses6/), [Promises](http://dev.modern.ie/platform/status/promiseses6/), [property shorthands](http://dev.modern.ie/platform/status/es6objectliteralenhancements/), [Proxies](http://dev.modern.ie/platform/status/proxieses6/), [spread operator](http://dev.modern.ie/platform/status/spreades6/), [String.prototype.includes()](http://dev.modern.ie/platform/status/stringbuiltinses6/), [String.prototype.startsWith()](http://dev.modern.ie/platform/status/stringbuiltinses6/), [Symbols](http://dev.modern.ie/platform/status/symbols/), and [template strings](http://dev.modern.ie/platform/status/templatestringses6/).

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

![Favorites](https://cloud.githubusercontent.com/assets/7266075/9255436/3488ccbe-419e-11e5-8df3-c10616e8c082.png)

## Additional functionality
There are several additional features implemented to make the browsing experience more pleasant:
* Keyboard shortcuts - press F11 to toggle fullscreen, ESC to exit fullscreen, or Ctrl + L to select the address bar
* [CSS transitions](http://www.w3.org/TR/css3-transitions/) for animating the menus
* Cache management
* Favorites management
* URL input analysis - "bing.com" navigates to http(s)://bing.com, "seahawks" searches Bing
* Auto-de/select the address bar on blur/focus
* Responsive design

## Citations
The logo is based on [trees by Nicholas Menghini](https://thenounproject.com/term/trees/65621/) from the Noun Project.
