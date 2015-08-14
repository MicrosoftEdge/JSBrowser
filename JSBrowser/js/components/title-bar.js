browser.on("init", function () {
    "use strict";

    // Set your default colors
    const BG_APP_COLOR = hexStrToRGBA("#f4f3f1");
    const BLACK = hexStrToRGBA("#000");
    const BRAND = hexStrToRGBA("#3B3B3B");
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
            return Object.assign(colorObject, {
                "r": parseInt(hexStr.slice(0, 2), 16),
                "g": parseInt(hexStr.slice(2, 4), 16),
                "b": parseInt(hexStr.slice(4, 6), 16),
                "a": parseInt("0xFF", 16)
            });
        }
        if (hexStr.length === 8) {
            // Alpha
            return Object.assign(colorObject, {
                "r": parseInt(hexStr.slice(0, 2), 16),
                "g": parseInt(hexStr.slice(2, 4), 16),
                "b": parseInt(hexStr.slice(4, 6), 16),
                "a": parseInt(hexStr.slice(6, 8), 16)
            });
        }
        if (hexStr.length === 3) {
            // Shorthand hex color
            let rVal = hexStr.slice(0, 1);
            let gVal = hexStr.slice(1, 2);
            let bVal = hexStr.slice(2, 3);

            return Object.assign(colorObject, {
                "r": parseInt(rVal + rVal, 16),
                "g": parseInt(gVal + gVal, 16),
                "b": parseInt(bVal + bVal, 16)
            });
        }
        throw new Error(`Invalid HexString length. Expected either 8, 6, or 3. The actual length was ${hexStr.length}`);
    }

    // Set the title bar colors when a menu is open
    this.setOpenMenuAppBarColors = () => {
        Object.assign(this.titleBar, {
            "foregroundColor": BLACK,
            "backgroundColor": BG_APP_COLOR,

            "buttonForegroundColor": BLACK,
            "buttonBackgroundColor": BG_APP_COLOR,

            "buttonHoverForegroundColor": WHITE,
            "buttonHoverBackgroundColor": GRAY,

            "buttonPressedForegroundColor": BG_APP_COLOR,
            "buttonPressedBackgroundColor": BLACK,

            "inactiveBackgroundColor": BG_APP_COLOR,

            "buttonInactiveBackgroundColor": BG_APP_COLOR,

            "buttonPressedForegroundColor": BG_APP_COLOR,
            "buttonPressedBackgroundColor": BG_APP_COLOR
        });
    };

    // Set the default title bar colors
    this.setDefaultAppBarColors = () => {
        Object.assign(this.titleBar, {
            "foregroundColor": WHITE,
            "backgroundColor": BRAND,

            "buttonForegroundColor": WHITE,
            "buttonBackgroundColor": BRAND,

            "buttonHoverForegroundColor": WHITE,
            "buttonHoverBackgroundColor": GRAY,

            "buttonPressedForegroundColor": BRAND,
            "buttonPressedBackgroundColor": WHITE,

            "inactiveForegroundColor": GRAY,
            "inactiveBackgroundColor": BRAND,

            "buttonInactiveForegroundColor": GRAY,
            "buttonInactiveBackgroundColor": BRAND,

            "buttonInactiveHoverForegroundColor": WHITE,
            "buttonInactiveHoverBackgroundColor": BRAND,

            "buttonPressedForegroundColor": BRAND,
            "buttonPressedBackgroundColor": BRAND
        });
    };

    // Brand the title bar
    this.setDefaultAppBarColors();
});
