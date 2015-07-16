document.addEventListener("DomContentLoaded", function (e) { 
    var notify_btn = document.getElementById("notify_btn");
    notify_btn.addEventListener("click", notify, false);
}
, false);


    function notify() {
        var object = window.CommunicatorWinRT;

        if (object) {
            object.toastMessage('Hello World', 0);
        } else {
            console.log('Error injected object not found');
        }

    }