import React from 'react';

function WeatherIcons(param) {

    switch(param) {
        case 'Fair (Day)': 
            return  <img src={require("../images/fairday.png")} alt="logo" />;
        case 'Fair (Night)':
            return  <img src={require("../images/fairnight.png")} alt="logo" />
        case 'Fair & Warm':
            return  <img src={require("../images/fairnwarm.png")} alt="logo" />
        case 'Partly Cloudy (Day)':
            return  <img src={require("../images/partlycloudyday.png")} alt="logo" />        
        case 'Partly Cloudy (Night)':
            return  <img src={require("../images/partlycloudynight.png")} alt="logo" />
        case 'Cloudy (Day)':
        case 'Cloudy':
            return  <img src={require("../images/cloudy.png")} alt="logo" />
        case 'Windy':
            return  <img src={require("../images/windy.png")} alt="logo" />
        case 'Light Rain':
            return  <img src={require("../images/lightrain.png")} alt="logo" />
        case 'Moderate Rain':
            return  <img src={require("../images/moderaterain.png")} alt="logo" />
        case 'Heavy Rain':
            return  <img src={require("../images/heavyrain.png")} alt="logo" />
        case 'Passing Showers':
            return  <img src={require("../images/passingshowers.png")} alt="logo" />
        case 'Light Showers':
            return  <img src={require("../images/lightshowers.png")} alt="logo" />
        case 'Showers':
            return  <img src={require("../images/showers.png")} alt="logo" />
        case 'Heavy Showers':
            return  <img src={require("../images/heavyshowers.png")} alt="logo" />
        case 'Thundery Showers':
            return  <img src={require("../images/thunderyshowers.png")} alt="logo" />
        case 'Heavy Thundery Showers':
            return  <img src={require("../images/heavythunderyshowers.png")} alt="logo" />
        case 'Heavy Thundery Showers with Gusty Winds':
            return  <img src={require("../images/heavythunderyshowerswind.png")} alt="logo" />
        default:
            return 
    }

}

export default WeatherIcons