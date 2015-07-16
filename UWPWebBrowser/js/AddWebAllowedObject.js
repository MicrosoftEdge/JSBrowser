document.addEventListener("DOMContentLoaded", ready, false)


function ready() {
    var webview = document.getElementById("WebView");

    //var communicationWinRT = new CommunicationWinRT.CommunicationWinRT();
    var communicationWinRT = new ToastWinRT.ToastClass();
    //var cameraWinRT = new CommunicationWinRT.cameraWinRT();
    webview.addEventListener("MSWebViewNavigationStarting", navigationStart);
    //webview.addApplicationObject("CommunicatorWinRT", communicationWinRT);
    //webview.addApplicationObject("cameraWinRT", cameraWinRT);
    webview.addWebAllowedObject("CommunicatorWinRT", communicationWinRT);
    //webview.addWebAllowedObject("cameraWinRT", cameraWinRT);
    webview.navigate("ms-appx-web:///pages/page.html");

}

function navigationStart() {

}