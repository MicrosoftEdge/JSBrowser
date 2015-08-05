document.addEventListener("DOMContentLoaded", () => {
    "use strict";
    
    let webview = document.querySelector("#WebView");
    webview.addWebAllowedObject("CommunicatorWinRT", new ToastWinRT.ToastClass);
    webview.navigate("ms-appx-web:///pages/page.html");
});
