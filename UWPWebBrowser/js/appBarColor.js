/*
    This function expects two hexStrings and relies on hexStrToRGBA to convert
    to a JSON object that represents RGBA for the underlying Windows API to 
    understand.

    Examples of valid values: 
    setAppBarColors('#FFFFFF','#000000');
    setAppBarColors('#FFF','#000');
    setAppBarColors('FFFFFF','000000');
    setAppBarColors('FFF','000');

*/

"use strict";

function setAppBarColors(brandColorHex, brandColorInactiveHex) {
    // Detect if the Windows namespace exists in the global object
    if (typeof Windows !== 'undefined' &&
             typeof Windows.UI !== 'undefined' &&
             typeof Windows.UI.ViewManagement !== 'undefined') {
        var brandColor = hexStrToRGBA(brandColorHex);
        var brandColorInactive = hexStrToRGBA(brandColorInactiveHex);
        // Get a reference to the App Title Bar
        var appTitleBar = Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar;

        var black = hexStrToRGBA('#000');
        var white = hexStrToRGBA('#FFF');

        appTitleBar.foregroundColor = brandColor;
        appTitleBar.backgroundColor = brandColor;

        appTitleBar.buttonForegroundColor = white;
        appTitleBar.buttonBackgroundColor = brandColor;

        appTitleBar.buttonHoverForegroundColor = white;
        appTitleBar.buttonHoverBackgroundColor = brandColor;

        appTitleBar.buttonPressedForegroundColor = brandColor;
        appTitleBar.buttonPressedBackgroundColor = white;

        appTitleBar.inactiveBackgroundColor = brandColorInactive;
        appTitleBar.inactiveForegroundColor = brandColor;

        appTitleBar.buttonInactiveForegroundColor = brandColor;
        appTitleBar.buttonInactiveBackgroundColor = brandColorInactive;

        appTitleBar.buttonInactiveHoverForegroundColor = brandColor;
        appTitleBar.buttonInactiveHoverBackgroundColor = brandColorInactive;

        appTitleBar.buttonPressedForegroundColor = brandColor;
        appTitleBar.buttonPressedBackgroundColor = brandColorInactive;
    }
}
// Helper function to support HTML hexColor Strings
function hexStrToRGBA(hexStr) {
    // RGBA color object
    var colorObject = { r: 255, g: 255, b: 255, a: 255 };

    // remove hash if it exists
    hexStr = hexStr.replace('#', '');

    if (hexStr.length === 6) {
        // No Alpha
        colorObject.r = parseInt(hexStr.slice(0, 2), 16);
        colorObject.g = parseInt(hexStr.slice(2, 4), 16);
        colorObject.b = parseInt(hexStr.slice(4, 6), 16);
        colorObject.a = parseInt('0xFF', 16);
    } else if (hexStr.length === 8) {
        // Alpha
        colorObject.r = parseInt(hexStr.slice(0, 2), 16);
        colorObject.g = parseInt(hexStr.slice(2, 4), 16);
        colorObject.b = parseInt(hexStr.slice(4, 6), 16);
        colorObject.a = parseInt(hexStr.slice(6, 8), 16);
    } else if (hexStr.length === 3) {
        // Shorthand hex color
        var rVal = hexStr.slice(0, 1);
        var gVal = hexStr.slice(1, 2);
        var bVal = hexStr.slice(2, 3);
        colorObject.r = parseInt(rVal + rVal, 16);
        colorObject.g = parseInt(gVal + gVal, 16);
        colorObject.b = parseInt(bVal + bVal, 16);
    } else {
        throw new Error('Invalid HexString length. Expected either 8, 6, or 3. The actual length was ' + hexStr.length);
    }
    return colorObject;
}

// Initialize when the Window loads
addEventListener('load', function () {
    var brandColor = '#333333';
    var brandColorInactive = '#333333';
    setAppBarColors(brandColor, brandColorInactive);
});