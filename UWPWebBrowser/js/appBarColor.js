"use strict";

// Set your default colors
var brand = hexStrToRGBA('#3B3B3B');
var bgAppColor = hexStrToRGBA("#f4f3f1");
var black = hexStrToRGBA('#000');
var white = hexStrToRGBA('#FFF');
var gray = hexStrToRGBA('#666');

function setOpenMenuAppBarColors() {
    // Detect if the Windows namespace exists in the global object
    if (typeof Windows !== 'undefined' &&
             typeof Windows.UI !== 'undefined' &&
             typeof Windows.UI.ViewManagement !== 'undefined') {
        // Get a reference to the App Title Bar
        var appTitleBar = Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar;

        appTitleBar.foregroundColor = black;
        appTitleBar.backgroundColor = bgAppColor;

        appTitleBar.buttonForegroundColor = black;
        appTitleBar.buttonBackgroundColor = bgAppColor;

        appTitleBar.buttonHoverForegroundColor = white;
        appTitleBar.buttonHoverBackgroundColor = gray;

        appTitleBar.buttonPressedForegroundColor = bgAppColor;
        appTitleBar.buttonPressedBackgroundColor = black;

        appTitleBar.inactiveBackgroundColor = bgAppColor;

        appTitleBar.buttonInactiveBackgroundColor = bgAppColor;

        appTitleBar.buttonInactiveHoverBackgroundColor = bgAppColor;

        appTitleBar.buttonPressedForegroundColor = bgAppColor;
        appTitleBar.buttonPressedBackgroundColor = bgAppColor;
    }
}

function setDefaultAppBarColors () {
    // Detect if the Windows namespace exists in the global object
    if (typeof Windows !== 'undefined' &&
             typeof Windows.UI !== 'undefined' &&
             typeof Windows.UI.ViewManagement !== 'undefined') {
        // Get a reference to the App Title Bar
        var appTitleBar = Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar;

        appTitleBar.foregroundColor = white;
        appTitleBar.backgroundColor = brand;

        appTitleBar.buttonForegroundColor = white;
        appTitleBar.buttonBackgroundColor = brand;

        appTitleBar.buttonPressedForegroundColor = brand;
        appTitleBar.buttonPressedBackgroundColor = white;

        appTitleBar.inactiveForegroundColor = gray;
        appTitleBar.inactiveBackgroundColor = brand;

        appTitleBar.buttonInactiveForegroundColor = gray;
        appTitleBar.buttonInactiveBackgroundColor = brand;

        appTitleBar.buttonInactiveHoverForegroundColor = white;
        appTitleBar.buttonInactiveHoverBackgroundColor = brand;

        appTitleBar.buttonPressedForegroundColor = brand;
        appTitleBar.buttonPressedBackgroundColor = brand;
    }
}

// Helper function to support HTML hexColor Strings
function hexStrToRGBA (hexStr) {
    // RGBA color object
    var colorObject = { r: 255, g: 255, b: 255, a: 255 };

    // Remove hash if it exists
    hexStr = hexStr.replace('#', '');

    if (hexStr.length === 6) {
        // No Alpha
        colorObject.r = parseInt(hexStr.slice(0, 2), 16);
        colorObject.g = parseInt(hexStr.slice(2, 4), 16);
        colorObject.b = parseInt(hexStr.slice(4, 6), 16);
        colorObject.a = parseInt('0xFF', 16);
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
        var rVal = hexStr.slice(0, 1);
        var gVal = hexStr.slice(1, 2);
        var bVal = hexStr.slice(2, 3);
        colorObject.r = parseInt(rVal + rVal, 16);
        colorObject.g = parseInt(gVal + gVal, 16);
        colorObject.b = parseInt(bVal + bVal, 16);
    }
    else {
        throw new Error('Invalid HexString length. Expected either 8, 6, or 3. The actual length was ' + hexStr.length);
    }
    return colorObject;
}

// Initialize when the window loads
addEventListener('load', setDefaultAppBarColors);