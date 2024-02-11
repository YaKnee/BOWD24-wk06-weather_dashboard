//https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`
//`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`

// const LAT = "61.5038";
// const LON = "23.8088";
//Louis's
// const API_KEY = "f34226b8317feebe5c91ec105e324c0c";
//mine
const API_KEY = "ef10c05609e96f73b1438826cd13b827";
const searchCity = document.getElementById("location");
let CITY = "Tampere";
const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",];
const weatherImages = document.getElementById("weather-image-container").querySelectorAll("img");



const displayBlock = (item) =>{
  item.forEach((element) => {
    element.style.display = "block";
  })
}
const displayNone = (item) => {

  item.forEach((element) => {
    element.style.display = "none";
  })
}
const oneDecimal = (degree) => {
 return (Math.round(degree * 10) / 10).toFixed(1);
}

let rightNow = Math.round( new Date().getTime() / 1000);
const timezoneOffset = new Date().getTimezoneOffset() * 60;
//console.log(new Date().getTimezoneOffset() * 60);

const createCurrentMainItem = (temp, feels_like, temp_max, temp_min, timezone) => { 
  let currentDate = new Date((rightNow + timezone + timezoneOffset)*1000);

  const config = {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const formatDate = currentDate.toLocaleString("en-US", config);
  document.getElementById("day").innerText = daysOfWeek[currentDate.getDay()];
  document.getElementById("date").innerText = formatDate;
  document.getElementById("temp").innerText = oneDecimal(temp) + "°C";
  document.getElementById("feels-like").innerHTML = '<i class="bi bi-person-fill-exclamation"></i> ' + oneDecimal(feels_like) + '°C';
  document.getElementById("temp-max").innerHTML = '<i class="bi bi-thermometer-high"></i> ' + oneDecimal(temp_max) + "°C";
  document.getElementById("temp-min").innerHTML = '<i class="bi bi-thermometer"></i> ' + oneDecimal(temp_min) + "°C";
};

const createCurrentLocationItem = (weather,icon,country) => { 
  const countryImage =  document.getElementById("country");
  countryImage.src = `https://flagcdn.com/${(country).toLowerCase()}.svg`;
  countryImage.style.width = "30px";
  countryImage.style.height = "15px";
  countryImage.alt = `${country} Flag`;
  const sun = document.getElementById("sun");
  const cloud = document.getElementById("cloud");
  const dcloud = document.querySelectorAll(".dcloud");
  const lightning = document.getElementById("lightning");
  const mist = document.querySelectorAll(".mist");
  const moon = document.getElementById("moon");
  const rain = document.querySelectorAll(".rain");
  const snow = document.querySelectorAll(".snow");
  displayNone(weatherImages);
  console.log(icon);
  switch (icon){
    case "01d":
      sun.style.display = "block";
      break;
    case "01n":
      moon.style.display = "block";
      break;
    case "02d":
      sun.style.display = "block";
      cloud.style.marginTop = "120px";
      cloud.style.display = "block"
      break;
    case "02n":
      moon.style.display = "block";
      cloud.style.display = "block"
      cloud.style.marginTop = "120px";
      dcloud[1].style.display = "block";
      dcloud[1].style.marginTop = "80px";
      break;
    case "02d":
      sun.style.display = "block";
      cloud.style.display = "block"
      break;
    case "04d":
      cloud.style.display = "block"
      dcloud[0].style.display = "block"
      break;
    case "04n":
      dcloud[1].style.display = "block"
      cloud.style.display = "block"
      break;
    case "09d":
    case "09n":
      displayBlock(dcloud);
      cloud.style.display = "block"
      cloud.style.zIndex = "1"
      displayBlock(rain);
      break;
    case "10d":
      sun.style.display = "block"
      sun.style.margin = "0 0 15% 25%"
      cloud.style.display = "block"
      cloud.style.marginTop = "5%"
      displayBlock(rain);
      break;
    case "10n":
      moon.style.display = "block"
      moon.style.margin = "0 0 80px 100px";
      cloud.style.display = "block"
      cloud.style.marginTop = "40px";
      dcloud[0].style.display = "block"
      dcloud[0].style.marginTop = "50px";
      dcloud[0].style.zIndex = "3"
      displayBlock(rain);
      break;
    case "11d":
    case "11n":
      dcloud.forEach((img) => {
        img.style.display = "block";
        img.style.zIndex = "3"
      });
      cloud.style.display = "block"
      lightning.style.display = "block"
      break;
    case "13n":
      displayBlock(dcloud);
      moon.style.display = "block"
      moon.style.margin = "0 0 80px 100px";
      cloud.style.display = "block"
      displayBlock(snow);
      break;
    case "13d":
      displayBlock(dcloud);
      cloud.style.display = "block"
      displayBlock(snow);
      break;
    case "50d":
      sun.style.display = "block"
      displayBlock(mist);
      mist[0].style.zIndex = "3";
      mist[1].style.zIndex = "3";
      break;
    case "50n":
      moon.style.display = "block"
      displayBlock(mist);
      mist[0].style.zIndex = "3";
      mist[1].style.zIndex = "3";
      break;
    default:
      cloud.style.display = "block"
      break;
  }
  // document.getElementById("weather-image").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  document.getElementById("weather-desc").innerText = weather;
};

const createCurrentMiscItem = (pressure,humidity,visibility,wind_speed,sunrise,sunset, dt, timezone) => {

  if (dt+timezone+timezoneOffset < sunset && dt+timezone + timezoneOffset > sunrise) {
    document.body.style.background = "linear-gradient(0deg, rgba(9,37,78,1) 28%, rgba(137,152,247,1) 94%)";
  } else {
    document.body.style.background = "linear-gradient(180deg, rgba(9,37,78,1) 28%, rgba(137,152,247,1) 83%)";
  }
  document.getElementById("pressure").innerText = "Pressure: " + pressure + "hPa";
  document.getElementById("humidity").innerText = "Humidity: " + humidity + "%";
  document.getElementById("visibility").innerText = "Visibility: " + visibility / 1000 + "km";
  document.getElementById("wind").innerText = "Wind: " + wind_speed + "m/s";
  const formatTime = (secondsUTC) => {
    const date = new Date((secondsUTC + timezone + timezoneOffset) * 1000);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };
  document.getElementById("sunrise").innerText = "Sunrise: " + formatTime(sunrise);
  document.getElementById("sunset").innerText = "Sunset: " + formatTime(sunset);

};

const populateCurrentWeatherDetails = (data) => { 

  createCurrentMainItem(
    data.main.temp,
    data.main.feels_like,
    data.main.temp_max,
    data.main.temp_min,
    data.timezone
  );
  createCurrentLocationItem(
    data.weather[0].description,
    data.weather[0].icon,
    data.sys.country
  );
  createCurrentMiscItem(
    data.main.pressure,
    data.main.humidity,
    data.visibility,
    data.wind.speed,
    data.sys.sunrise,
    data.sys.sunset,
    data.dt, 
    data.timezone
  );
};

const errorMessage = document.querySelectorAll(".not-found");

const fetchCurrentWeather = async () => {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`);
    const data = await response.json();
    //console.log(data);
    displayNone(errorMessage);
    populateCurrentWeatherDetails(data);
    setTimeout(fetchCurrentWeather, 1000 * 60 * 60 * 3); //calls every 3hrs
  } catch (error) {
    displayNone(weatherImages);
    displayBlock(errorMessage);
    // console.error(error);
  }
};
fetchCurrentWeather();

const createDailyWeather = (weatherObject) => {
  const currentShortDay = daysOfWeek[new Date().getDay()].replace(/day|nesday|urday/, '');

  const forecast = document.getElementById("forecast");
  const weatherForecast = document.createElement("div");
  if ( currentShortDay === weatherObject.day){
    weatherForecast.className = "forecast-container shadow highlight";
  }else{
  weatherForecast.className = "forecast-container shadow";
  }
  
  const forecastDate = document.createElement("div");
  forecastDate.className = "forecast-date-container"

  const dayName = document.createElement("p");
  dayName.className = "day";
  dayName.innerText = weatherObject.day;
  forecastDate.append(dayName);

  const date = document.createElement("p");
  date.className = "date";
  date.innerText = weatherObject.date;
  forecastDate.append(date);

  weatherForecast.append(forecastDate);

  const forecastTemp = document.createElement("p");
  forecastTemp.className = "forecast-temp";
  forecastTemp.innerText = oneDecimal(weatherObject.temp) + "°C";
  weatherForecast.append(forecastTemp);

  const weatherImage = document.createElement("img");
  weatherImage.className = "forecast-image ";
  const weatherImages = {
    "01d": "images/forecast-sun.png",
    "01n": "images/forecast-moon.png",
    "02d": "images/forecast-sun-cloud.png",
    "02n": "images/forecast-moon-cloud.png",
    "03d": "images/cloud.png",
    "03n": "images/cloud.png",
    "04d": "images/forecast-dark-clouds.png",
    "04n": "images/forecast-dark-clouds.png",
    "09d": "images/forecast-rain.png",
    "09n": "images/forecast-rain.png",
    "10d": "images/forecast-sun-rain.png",
    "10n": "images/forecast-moon-rain.png",
    "11d": "images/forecast-lightning.png",
    "11n": "images/forecast-lightning.png",
    "13d": "images/forecast-snow.png",
    "13n": "images/forecast-snow.png",
    "50d": "images/forecast-sun-mist.png",
    "50n": "images/forecast-moon-mist.png",
  };
  weatherImage.src = weatherImages[weatherObject.icon] || "images/cloud.png";
  // weatherImage.src = `https://openweathermap.org/img/wn/${weatherObject.icon}@2x.png`;
  weatherForecast.append(weatherImage);

  const weatherDesc = document.createElement("div");
  weatherDesc.className = "forecast-text-container";

  const weatherDescText = document.createElement("p");
  weatherDescText.innerText = weatherObject.weather;
  weatherDesc.appendChild(weatherDescText);

  weatherForecast.append(weatherDesc);

  const highLow = document.createElement("div");
  highLow.className = "high-low-container";

  const highTemp = document.createElement("p");
  highTemp.className = "high-temp";
  highTemp.innerHTML = '<i class="bi bi-thermometer-high" style="margin-right: 5px;"></i><strong>' + oneDecimal(weatherObject.highTemp) + "°C</strong>";
  highLow.append(highTemp);

  const lowTemp = document.createElement("p");
  lowTemp.className = "low-temp";
  lowTemp.innerHTML = '<i class="bi bi-thermometer" style="margin-right: 5px;"></i><strong>' + oneDecimal(weatherObject.lowTemp) + "°C</strong>";
  highLow.append(lowTemp);

  weatherForecast.append(highLow);
  forecast.append(weatherForecast);
};

const getDailyWeatherElements = (dayArray) => {
  const day = new Date(dayArray.date);
  const dayOfWeek = daysOfWeek[day.getDay()].replace(/day|nesday|urday/, '');
  const dateMonth = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStrings = ["09:00:00", "12:00:00","15:00:00","18:00:00","21:00:00"]; 
  //will only display days with array size 4 or more
  //find index of first object that matches any of the times
  const weatherDescriptionIndex = dayArray.array.findIndex(object =>
    timeStrings.some(timeString => 
      object.dt_txt.includes(timeString))
  );
 const weatherDescription = dayArray.array[weatherDescriptionIndex].weather[0].description;
  const icon = dayArray.array[weatherDescriptionIndex].weather[0].icon;

  const averageTemps = dayArray.array.map((entry) => entry.main.temp);
  const temp = averageTemps.reduce((sum, temp) => sum + temp, 0) / averageTemps.length;
  const highTemp = Math.max(...dayArray.array.map((entry) => entry.main.temp_max));
  const lowTemp = Math.min(...dayArray.array.map((entry) => entry.main.temp_min));

  createDailyWeather({
    day: dayOfWeek,
    date: dateMonth,
    weather: weatherDescription,
    icon: icon,
    temp: temp,
    highTemp: highTemp,
    lowTemp: lowTemp,
  });
};

const groupWeatherByDate = (data) => {

  let daysGrouped = {};
  data.list.forEach((dateString) => {
    const date = dateString.dt_txt.split(" ")[0];

    if (!daysGrouped[date]) {
      daysGrouped[date] = [dateString];
    } else {
      daysGrouped[date].push(dateString);
    }
  });
 
  let daysArray = Object.entries(daysGrouped).map(([date, array]) => ({date,array}));

  //--------------------------Comment Out to Add current day's forecast
  if(daysArray[0].array.length < 4){
    daysArray.shift()

  }
  //console.log(daysArray);

  daysArray.forEach((dayArray) => getDailyWeatherElements(dayArray));
};

const fetchWeatherForecast = async () => {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric`);
    const data = await response.json();
    //console.log(data);
    groupWeatherByDate(data);
    createChart(data);
    setTimeout(fetchWeatherForecast, 1000 * 60 * 60 * 3);
  } catch (error) {
    console.error(error);
  }
};
fetchWeatherForecast();

let myChart = null;
const createChart = (data) => {
  console.log(data.list);
  const times = data.list.map(time => time.dt_txt);
  const temps = data.list.map(temp => temp.main.temp);
  console.log(temps);
  console.log(times);
  const chartCtx = document.getElementById("forecast-chart").getContext("2d");
  if (myChart !== null) {
    myChart.destroy();
  }
  myChart = new Chart(chartCtx, {
    type: "line",
    data: {
        labels: times,
        datasets: [{
            label: "°C",
            data: temps,
            //backgroundColor: "red",
            borderColor: "rgb(255,196,0)",
            borderWidth: 1,
            fill: "origin",
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
            },
            x: {
              ticks: {
                  display: false,
              }
          }
        },
        plugins: {
            legend: {
                display: false,
                position: "bottom",
            },
            title: {
                display: true,
                text: "Temperature (°C)",
                color: "white"
            },
        },
        interaction: {
            intersect: false,
            mode: 'nearest',
            axis: "x",
        }

    }
});

};
const resetPage = () => {
  console.log("Resetting");
  const paragraphs = document.getElementById("current-temp").querySelectorAll('p:not(.not-found)');
  paragraphs.forEach(paragraph => {
    paragraph.innerHTML = "";
  });
  document.getElementById("forecast").innerHTML = "";
  myChart.destroy();
}
const updateLocation = () => {
  const locationInput = document.getElementById("location-input");
  resetPage();
  CITY = locationInput.value;
  fetchCurrentWeather();
  fetchWeatherForecast();
};
const submitButton = document.getElementById("submit-button");
// const submitText = document.getElementById("location-input");
submitButton.onpointerdown = updateLocation;
// submitText.addEventListener("keypress", handleKeyPress);

// const handleKeyPress = (event) => {
//   if (event.key === "Enter") {
//     updateLocation();
//   }
// };