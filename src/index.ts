//Element selection
const bodyEl = document.querySelector("body") as HTMLBodyElement;
const currentLocationButton = document.getElementById("currentLocationButton") as HTMLButtonElement;
const cityInputField = document.getElementById("searchCity") as HTMLInputElement;
const citySearchButton = document.getElementById("cityNameSeachButton") as HTMLButtonElement;
const temperatureDisplay = document.getElementById("tempUnit") as HTMLSpanElement;
const cityName = document.getElementById("cityName") as HTMLHeadElement;
const currentDateAndTime = document.getElementById("dateTime") as HTMLParagraphElement;
const parameters = document.querySelector(".parameters") as HTMLDivElement;
const tempParameter = parameters.querySelector(".temperature-parameter") as HTMLParagraphElement;
const feelsLikeParameter = parameters.querySelector(".feels-like-parameter") as HTMLParagraphElement;
const windSpeedParameter = parameters.querySelector(".wind-speed-parameter") as HTMLParagraphElement;
const cloudCoverParameter = parameters.querySelector(".cloud-cover-parameter") as HTMLParagraphElement;
const sunriseParameter = parameters.querySelector(".sunrise-parameter") as HTMLParagraphElement;
const sunsetParameter = parameters.querySelector(".Sunset-parameter") as HTMLParagraphElement;
const currentCityParameter = parameters.querySelector(".current-city-parameter") as HTMLParagraphElement;
const weatherStatusInfo = document.getElementById("statusInfo") as HTMLParagraphElement;
const statusIcon = document.getElementById("statusIcon") as HTMLImageElement;




//Get current date and time using Shift Seconds UTC timezone

const getCurrentDateAndTime = (timezone: any)=>{
    
    const shiftInSeconds = timezone; 
    const date = new Date();
    const timezoneOffset = date.getTimezoneOffset();
    const newTimezoneOffset = timezoneOffset - (shiftInSeconds / 60);
    const newDate = new Date(date.getTime() + (newTimezoneOffset * 60 * 1000));
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "july", "Aug", "Sept", "Oct", "Nov", "Dec"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let month = months[newDate.getMonth()];
    let _date: any = newDate.getDate();
    if(_date < 10){
        _date = "0" + _date;
    }
    let fullYear = newDate.getFullYear();
    let hour: any = newDate.getHours();
    let hours12:any = ((hour % 12) || 12);
    if(hours12 < 10){
        hours12 = "0" + hours12;
    }
    let minute: any = newDate.getMinutes();
    if(minute < 10){
        minute = "0" + minute;
    }
    let day = days[newDate.getDay()];
    currentDateAndTime.innerHTML = `
        ${hours12}:${minute} - ${day}, ${month} ${fullYear} 
    `;
}


//Get user position using city name
citySearchButton.addEventListener("click", ()=>{
    let insertedCityName = cityInputField.value.toLowerCase().toString();
   getLatitudeandLongitudeFromCityName(insertedCityName);
});


//Get latitude and longitude from city name
const getLatitudeandLongitudeFromCityName = (cityName: string)=>{
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=bb3eb2dfdd4bdffb35d6eb6e0f1e1534`)
    .then((res)=>res.json())
    .then((res)=>{
        let latitude = res[0].lat;
        let longitude = res[0].lon;
        getWeatherData(latitude, longitude);
    })
}



//Get weather data from the API
const getWeatherData = (latitude: number, longitude: number)=>{
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=bb3eb2dfdd4bdffb35d6eb6e0f1e1534`)
    .then((res)=>res.json())
    .then((res)=>{
        let city  = res.name;
        kelvinToCelsius(res.main.temp);     //Convert temperature kelvin to celsius
        getCurrentDateAndTime(res.timezone);   //Push the timezone shift UTC to get current date and time;
        feelsLikeKelvinToCelsius(res.main.feels_like);   //Convert temperature kelvin to celsius
        let windSpeed = Math.ceil(res.wind.speed * 1.94384);       //Windspeed m/s to knots
        let cloudCover = res.clouds.all;        //Get cloud cover percentage;
        convertSunriseTime(res.sys.sunrise);        //Push the sunrise unix timestamp for converting it to a human readable form
        convertSunsetTime(res.sys.sunset);        //Push the sunset unix timestamp for converting it to a human readable form
        captitalizeWeatherStatus(res.weather[0].description);       //Push weather status to capitalize
        changeBg(res.weather[0].description);       //push the weather info to change the background image accordingly
        //Setting values to individual elements
        cityName.innerHTML = city;
        windSpeedParameter.innerHTML = windSpeed + " Knots";
        cloudCoverParameter.innerHTML = cloudCover + "%";
        currentCityParameter.innerHTML = city;
    });
}


//Get current user location using geo location API
const getCurrentLocation = ()=>{
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showCurrentPosition);
    }else{
        console.log("Geolocation is not supported by this browser!");
    }

    function showCurrentPosition(position: any){
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        getWeatherData(latitude, longitude);
    }
  
}

//Get the current lattitude and longitude using dedicated button
currentLocationButton.addEventListener("click", getCurrentLocation)





//Convert all units to standard form

//convert temperature kelvin to celsius
const kelvinToCelsius = (kelvin: number)=>{
    let celsius = Math.floor(kelvin - 273.15);
    temperatureDisplay.innerHTML = celsius + "°";
    tempParameter.innerHTML = celsius + "°C";
}

//Convert Feels like Kelvin to Celsius
const feelsLikeKelvinToCelsius = (kelvin: number)=>{
    let celsius = Math.floor(kelvin - 273.15);
    feelsLikeParameter.innerHTML = celsius + "°C";
}

//Convert unix timestamp to human readable formate for sunrise

const convertSunriseTime = (unixTimestamp: any)=>{
    const givenTimeStamp = unixTimestamp;
    const date = new Date(givenTimeStamp * 1000);
    
    let hours:any = date.getHours();
    if(hours < 10){
        hours = "0" + hours;
    }
    let minutes:any = date.getMinutes();
    if(minutes < 10){
        minutes = "0" + minutes;
    }
    sunriseParameter.innerHTML = `${hours}:${minutes} AM`;
    
}


//Convert unix timestamp to human readable formate for snset

const convertSunsetTime = (unixTimestamp: any)=>{
    const givenTimeStamp = unixTimestamp;
    const date = new Date(givenTimeStamp * 1000);
    const hours = date.getHours();

    let hours12:any = ((hours % 12) || 12);
    if(hours12 < 10){
        hours12 = "0" + hours12;
    }
    let minutes:any = date.getMinutes();
    if(minutes < 10){
        minutes = "0" + minutes;
    }
    sunsetParameter.innerHTML = `${hours12}:${minutes} PM`;
    
}

//Captitalize fist character of weather status
const captitalizeWeatherStatus = (weatherStatus: any)=>{
    let string = weatherStatus;
    let firstCharacter = string.charAt(0);
    firstCharacter = firstCharacter.toUpperCase();
    let capitalizedString = firstCharacter + string.slice(1);
    weatherStatusInfo.innerHTML = capitalizedString; 
}


//Load all the information using local latitude and logitude
window.addEventListener("DOMContentLoaded", getCurrentLocation);








//Change background image according to the weather condition
const changeBg = (weatherCondition: any)=>{
    switch(weatherCondition){
        case "clear sky" : bodyEl.style.backgroundImage = "url('../Images/clearSky.jpg')" , statusIcon.src = "../Images/icons/clearSky.png";
        break;
        case "few clouds" : bodyEl.style.backgroundImage = "url('../Images/fewClouds.jpg')" , statusIcon.src = "../Images/icons/clearSky.png";
        break;
        case "scattered clouds" : bodyEl.style.backgroundImage = "url('../Images/scaClouds.jpg')" , statusIcon.src = "../Images/icons/scaClouds.png";
        break;
        case "broken clouds" : bodyEl.style.backgroundImage = "url('../Images/brokenClouds.jpg')" , statusIcon.src = "../Images/icons/scaClouds.png";
        break;
        case "light rain" :  bodyEl.style.backgroundImage = "url('../Images/showerRain.jpg')" , statusIcon.src = "../Images/icons/scaClouds.png";
        break;
        case "rain" :  bodyEl.style.backgroundImage = "url('../Images/rain.jpg')" , statusIcon.src = "../Images/icons/rain.png";
        break;
        case "thunderstorm" :  bodyEl.style.backgroundImage = "url('../Images/thunder.jpg')" , statusIcon.src = "../Images/icons/thunder.png";
        break;
        case "light snow" :  bodyEl.style.backgroundImage = "url('../Images/snow.jpg')" , statusIcon.src = "../Images/icons/snow.png";
        break;
        case "mist" : bodyEl.style.backgroundImage = "url('../Images/mist.jpg')" , statusIcon.src = "../Images/icons/mist.png";
        break;
        default :  bodyEl.style.backgroundImage = "url('../Images/clearSky.jpg')" , statusIcon.src = "../Images/icons/clearSky.png";
    }
}











