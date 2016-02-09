/* Windows Runtime JS shim by Jerzy Głowacki. License: MIT */


NWGui = require('nw.gui');

Promise.prototype.done = Promise.prototype.then; // Promise.done is removed

if (typeof setImmediate === "undefined") {
	setImmediate = setTimeout; // setImmediate is IE/Edge only
}

if (typeof Proxy === "undefined") {
	Proxy = function (target, object) { // Proxy will land in Chrome 49
		return Object.assign(target, object);
	};
}

if (typeof NativeListener === "undefined") {
	NativeListener = {
		KeyHandler: function () {} // Stub
	};
}

if (typeof Windows === "undefined") {
	Windows = {
		Foundation: {
			Uri: function (uri) {
				var url = new URL(uri);
				url.schemeName = url.protocol.slice(0, -1);
				url.userName = url.username;
				url.path = url.pathname;
				url.query = url.search;
				url.fragment = url.hash;
				return url;
			}
		},
		Storage: {
			ApplicationData: {
				current: {
					roamingFolder: {
						createFileAsync: function (file, option) {
							return new Promise(function (resolve, reject) {
								resolve(file);
							});
						},
						getFileAsync: function (file) {
							return new Promise(function (resolve, reject) {
								resolve(file);
							});
						}
					}
				}
			},
			CreationCollisionOption: {
				replaceExisting: 0
			},
			FileIO: {
				readTextAsync: function (file) {
					return new Promise(function (resolve, reject) {
						resolve(localStorage.getItem(file));
					});
				},
				writeTextAsync: function (file, contents) {
					return new Promise(function (resolve, reject) {
						resolve(localStorage.setItem(file, contents));
					});
				}
			}
		},
		System: {
			Launcher: {
				launchURIAsync: function (url) {
					NWGui.Shell.openExternal(url);
				}
			}
		},
		UI: {
			ViewManagement: {
				ApplicationView: {
					getForCurrentView: function () {
						return Object.assign(document.getElementById('browser'), {
							isFullScreenMode: NWGui.Window.get().isFullscreen,
							exitFullScreenMode: NWGui.Window.get().leaveFullscreen,
							tryEnterFullScreenMode: NWGui.Window.get().enterFullscreen,
							titleBar: {},
						});
					}
				}
			}
		},
		Web: {
			Http: {
				HttpClient: function () {
					return {
						getAsync: function (url, option) {
							return new Promise(function (resolve, reject) {
								var xhr = new XMLHttpRequest();
								var method = (option === 0 ? 'HEAD' : 'GET');
								xhr.open(method, url);
								xhr.onload = function () {
								      var isSuccessStatusCode = (this.status === 200 ? true : false);
								      resolve({isSuccessStatusCode: isSuccessStatusCode});
								};
								xhr.onerror = function () {
								      reject();
								};
								xhr.send();
							});
						}
					};
				},
				HttpCompletionOption: {
					responseHeadersRead: 0,
					responseContentRead: 1
				}
			}
		}
	};
}

WebView = Object.assign(document.getElementById('WebView'), {
	documentTitle: '',
	navigate: function (url) {
		this.src = url;
	},
	refresh: function () {
		this.reload();
	},
	goBack: function () {
		this.back();
	},
	goForward: function () {
		this.forward();
	},
	addWebAllowedObject: function (name, obj) {},
	invokeScriptAsync: function (fun, arg) {
		var that = this;
		return {
			oncomplete: function () {},
			onerror: function () {},
			start: function () {
				var that2 = this;
				that.executeScript({code: arg}, function(results) {
					if (results) {
						that2.oncomplete({
							target: {
								result: results[0]
							}
						});
					} else {
						that2.onerror({
							message: 'no result'
						});
					}
				});
			}
		};
	}
});
WebView.addEventListener('loadstart', function (e) {
	console.log('loadstart', e);
	if (e.isTopLevel) {
		var msEvent = new Event('MSWebViewNavigationStarting');
		msEvent.uri = e.url;
		this.dispatchEvent(msEvent);
	}
});
WebView.addEventListener('loadstop', function (e) {
	console.log('loadstop', e);
	var msEvent = new Event('MSWebViewNavigationCompleted');
	msEvent.uri = e.target.src;
	this.dispatchEvent(msEvent);
});
WebView.addEventListener('contentload', function (e) {
	console.log('contentload', e);
	var msEvent = new Event('MSWebViewDOMContentLoaded');
	this.dispatchEvent(msEvent);
});
WebView.addEventListener('newwindow', function (e) {
	console.log('newwindow', e);
	var msEvent = new Event('MSWebViewNewWindowRequested');
	msEvent.uri = e.url;
	this.dispatchEvent(msEvent);
});
WebView.addEventListener('permissionrequest', function (e) {
	console.log('permissionrequest', e);
	var msEvent = new Event('MSWebViewPermissionRequested');
	msEvent.permissionRequest = {
		type: e.permission,
		allow: e.request.allow
	};
	this.dispatchEvent(msEvent);
});
WebView.addEventListener('loadabort', function (e) {
	console.log('loadabort', e);
	if (e.reason === 'ERR_UNKNOWN_URL_SCHEME') {
		var msEvent = new Event('MSWebViewUnsupportedURISchemeIdentified');
		msEvent.message = e.url;
		this.dispatchEvent(msEvent);
	}
});
