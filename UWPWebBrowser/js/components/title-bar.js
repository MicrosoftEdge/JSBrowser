browser.on("init", function () {
    "use strict";

    // Set your default colors
    const BRAND = hexStrToRGBA("#3B3B3B");
    const BG_APP_COLOR = hexStrToRGBA("#f4f3f1");
    const BLACK = hexStrToRGBA("#000");
    const GRAY = hexStrToRGBA("#666");
    const WHITE = hexStrToRGBA("#FFF");

    // Helper function to support HTML hexColor Strings
    function hexStrToRGBA(hexStr) {
        // RGBA color object
        let colorObject = { "r": 255, "g": 255, "b": 255, "a": 255 };

        // Remove hash if it exists
        hexStr = hexStr.replace("#", "");

        if (hexStr.length === 6) {
            // No Alpha
            colorObject.r = parseInt(hexStr.slice(0, 2), 16);
            colorObject.g = parseInt(hexStr.slice(2, 4), 16);
            colorObject.b = parseInt(hexStr.slice(4, 6), 16);
            colorObject.a = parseInt("0xFF", 16);
        }
        else if (hexStr.length === 8) {
            // Alpha
            colorObject.r = parseInt(hexStr.slice(0, 2), 16);
            colorObject.g = parseInt(hexStr.slice(2, 4), 16);
            colorObject.b = parseInt(hexStr.slice(4, 6), 16);
            colorObject.a = parseInt(hexStr.slice(6, 8), 16);
        }
        else if (hexStr.length === 3) {
            // Shorthand hex color
            let rVal = hexStr.slice(0, 1);
            let gVal = hexStr.slice(1, 2);
            let bVal = hexStr.slice(2, 3);
            colorObject.r = parseInt(rVal + rVal, 16);
            colorObject.g = parseInt(gVal + gVal, 16);
            colorObject.b = parseInt(bVal + bVal, 16);
        }
        else {
            throw new Error(`Invalid HexString length. Expected either 8, 6, or 3. The actual length was ${hexStr.length}`);
        }
        return colorObject;
    }


    // Set the title bar colors when a menu is open
    this.setOpenMenuAppBarColors = () => {
        // Detect if the Windows namespace exists in the global object
        if (!(typeof Windows !== 'undefined' &&
                 typeof Windows.UI !== 'undefined' &&
                 typeof Windows.UI.ViewManagement !== 'undefined')) {
            return;
        }
        // Get a reference to the App Title Bar
        let appTitleBar = Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar;

        appTitleBar.foregroundColor = BLACK;
        appTitleBar.backgroundColor = BG_APP_COLOR;

        appTitleBar.buttonForegroundColor = BLACK;
        appTitleBar.buttonBackgroundColor = BG_APP_COLOR;

        appTitleBar.buttonHoverForegroundColor = WHITE;
        appTitleBar.buttonHoverBackgroundColor = GRAY;

        appTitleBar.buttonPressedForegroundColor = BG_APP_COLOR;
        appTitleBar.buttonPressedBackgroundColor = BLACK;

        appTitleBar.inactiveBackgroundColor = BG_APP_COLOR;

        appTitleBar.buttonInactiveBackgroundColor = BG_APP_COLOR;

        appTitleBar.buttonPressedForegroundColor = BG_APP_COLOR;
        appTitleBar.buttonPressedBackgroundColor = BG_APP_COLOR;
    };

    // Set the default title bar colors
    this.setDefaultAppBarColors = () => {
        // Detect if the Windows namespace exists in the global object
        if (!(typeof Windows !== 'undefined' &&
                 typeof Windows.UI !== 'undefined' &&
                 typeof Windows.UI.ViewManagement !== 'undefined')) {
            return;
        }
        // Get a reference to the App Title Bar
        let appTitleBar = Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar;

        appTitleBar.foregroundColor = WHITE;
        appTitleBar.backgroundColor = BRAND;

        appTitleBar.buttonForegroundColor = WHITE;
        appTitleBar.buttonBackgroundColor = BRAND;

        appTitleBar.buttonHoverForegroundColor = WHITE;
        appTitleBar.buttonHoverBackgroundColor = GRAY;

        appTitleBar.buttonPressedForegroundColor = BRAND;
        appTitleBar.buttonPressedBackgroundColor = WHITE;

        appTitleBar.inactiveForegroundColor = GRAY;
        appTitleBar.inactiveBackgroundColor = BRAND;

        appTitleBar.buttonInactiveForegroundColor = GRAY;
        appTitleBar.buttonInactiveBackgroundColor = BRAND;

        appTitleBar.buttonInactiveHoverForegroundColor = WHITE;
        appTitleBar.buttonInactiveHoverBackgroundColor = BRAND;

        appTitleBar.buttonPressedForegroundColor = BRAND;
        appTitleBar.buttonPressedBackgroundColor = BRAND;
    };

    // BRAND the title bar
    this.setDefaultAppBarColors();
});