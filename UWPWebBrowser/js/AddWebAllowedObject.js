
function ready() {
    var webview = document.getElementById("WebView");
    var communicationWinRT = new ToastWinRT.ToastClass();

    webview.addEventListener("MSWebViewNavigationStarting", navigationStart);
    webview.addWebAllowedObject("CommunicatorWinRT", communicationWinRT);
    webview.navigate("ms-appx-web:///pages/page.html");
}

document.addEventListener("DOMContentLoaded", ready);
