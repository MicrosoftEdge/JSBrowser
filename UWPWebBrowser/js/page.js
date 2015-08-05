document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    document.querySelector("#notify_btn").addEventListener("click", () => {
        var object = window.CommunicatorWinRT;
        if (object) {
            object.toastMessage("Hello World", 0);
        } else {
            console.log("Error injected object not found");
        }
    });
});