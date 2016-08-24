browser.on("init", function () {
    "use strict";

    // Show Personalization Menu
    this.personalization.addEventListener("click", () => {
        this.goback.style.display = "block";
        this.coloroptions.style.display = "block";
        this.clearCacheButton.style.display = "none";
        this.clearFavButton.style.display = "none";
        this.personalization.style.display = "none";
        this.fullscreenButton.style.display = "none";
        
    });

    // Go Back from Personalization
    this.goback.addEventListener("click", () => {

        this.clearCacheButton.style.display = "block";
        this.clearFavButton.style.display = "block";
        this.personalization.style.display = "block";
        this.fullscreenButton.style.display = "block";
        this.goback.style.display = "none";
        this.coloroptions.style.display = "none";

    });

    // Go to Color Options 
    this.coloroptions.addEventListener("click", () => {
        this.gobackfromcolormenu.style.display = "block";
        this.navbarcolor.style.display = "block";
        this.clearCacheButton.style.display = "none";
        this.clearFavButton.style.display = "none";
        this.personalization.style.display = "none";
        this.fullscreenButton.style.display = "none";
        this.goback.style.display = "none";
        this.coloroptions.style.display = "none";
        
    });

    // Go back from Color Options
    this.gobackfromcolormenu.addEventListener("click", () => {
        this.goback.style.display = "block";
        this.coloroptions.style.display = "block";
        this.clearCacheButton.style.display = "none";
        this.clearFavButton.style.display = "none";
        this.personalization.style.display = "none";
        this.fullscreenButton.style.display = "none";
        this.gobackfromcolormenu.style.display = "none";
        this.navbarcolor.style.display = "none";
    });

    // Go to Navigation Bar Color Options
    this.navbarcolor.addEventListener("click", () => {
        this.gobackfromnavbarcolor.style.display = "block";
        this.defaultnavbarcolor.style.display = "block";
        this.setNavbarToColorRed.style.display = "block";
        this.setNavbarToColorBlue.style.display = "block";
        this.gobackfromcolormenu.style.display = "none";
        this.coloroptions.style.display = "none";
        this.navbarcolor.style.display = "none";
        

    });

    // Go Back from Navigation Bar Color Options
    this.gobackfromnavbarcolor.addEventListener("click", () => {
        this.gobackfromcolormenu.style.display = "block";
        this.navbarcolor.style.display = "block";
        this.gobackfromnavbarcolor.style.display = "none";
        this.defaultnavbarcolor.style.display = "none";
        this.setNavbarToColorRed.style.display = "none";
        this.setNavbarToColorBlue.style.display = "none";
       
    });
    
    // Navigation Bar -- Set Color From Local Storage
    this.navbar.style.background = localStorage.getItem("navbarColor");

    // Set Navbar To Default Color
    this.defaultnavbarcolor.addEventListener("click", () => {
        this.navbar.style.background = "linear-gradient(to bottom, #3b3b3b 0%, #222 100%)";
        localStorage.setItem("navbarColor", "linear-gradient(to bottom, #3b3b3b 0%, #222 100%)");
	
    });

    // Set Navbar To Color Red

    this.setNavbarToColorRed.addEventListener("click", () => {
        this.navbar.style.background = "red";
        localStorage.setItem("navbarColor", "red");

    });

    // Set Navbar to Color Blue

    this.setNavbarToColorBlue.addEventListener("click", () => {
        this.navbar.style.background = "blue";
        localStorage.setItem("navbarColor", "blue");

    });

});
