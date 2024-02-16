const API_KEY = "ef10c05609e96f73b1438826cd13b827";
const searchCity = document.getElementById("location");
let CITY = "Tampere";
const daysOfWeek = ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const weatherImages = document.getElementById("weather-image-container").querySelectorAll("img");

const displayBlock = (item) => {
  item.forEach((element) => {
    element.style.display = "block";
  });
};
const displayNone = (item) => {
  item.forEach((element) => {
    element.style.display = "none";
  });
};
const oneDecimal = (degree) => {
  return (Math.round(degree * 10) / 10).toFixed(1);
};

const getInputLocation = () => {
  try {
    const cityInput = document.getElementById("location-input");
    const fetchAndUpdate = () => {
      let initialCity = sessionStorage.getItem("current-city");
      if (!initialCity) {
        initialCity = cityInput.value;
      } else {
        cityInput.value = initialCity;
      }
      fetchGeoLocation(initialCity);
    };

    const citySubmit = document.getElementById("submit-button");
    citySubmit.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      const city = cityInput.value;
      sessionStorage.setItem("current-city", city);
      cityInput.value = "";
      resetPage();
      fetchAndUpdate();
    });
    fetchAndUpdate();
  } catch (error) {
    console.log(error);
  }
};

const fetchGeoLocation = async (city) => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
    );
    const data = await response.json();
    sessionStorage.setItem("latitude", data.results[0].latitude);
    sessionStorage.setItem("longitude", data.results[0].longitude);
    fetchWeatherData(data.results[0].country_code);
    //console.log(data);
  } catch (error) {
    console.log(error);
    displayNone(weatherImages);
    displayBlock(errorMessage);
  }
};

const errorMessage = document.querySelectorAll(".not-found");

const fetchWeatherData = async (countryCode) => {
  try {
    let lat = sessionStorage.getItem("latitude");
    let long = sessionStorage.getItem("longitude");
    //response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=61.49773&longitude=23.779099&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&wind_speed_unit=ms&timezone=auto`);
    let response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}9&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&wind_speed_unit=ms&timezone=auto`
    );
    const data = await response.json();
    console.log(data);
    const isDay = data.current.is_day;
    displayNone(errorMessage);
    populateCurrentWeatherDetails(data, countryCode, isDay);
    groupWeatherByDate(data, isDay);
    createChart(data);

    setTimeout(fetchWeatherData, 1000 * 60 * 60 * 3); //calls every 3hrs
  } catch (error) {
    displayNone(weatherImages);
    displayBlock(errorMessage);
  }
};

const populateCurrentWeatherDetails = (data, countryCode, isDay) => {
  const now = data.current.time.split("T")[1];
  const sunrise = data.daily.sunrise[0].split("T")[1];
  const sunset = data.daily.sunset[0].split("T")[1];
  if (now < sunset && now > sunrise) {
    document.body.style.background =
      "linear-gradient(0deg, rgba(9,37,78,1) 28%, rgba(137,152,247,1) 94%)";
  } else {
    document.body.style.background =
      "linear-gradient(180deg, rgba(9,37,78,1) 28%, rgba(137,152,247,1) 83%)";
  }

  createCurrentMainItem(
    data.current.time,
    data.current.temperature_2m,
    data.current.apparent_temperature,
    data.daily.temperature_2m_max[0],
    data.daily.temperature_2m_min[0]
  );
  createCurrentLocationItem(
    data.current.weather_code,
    countryCode,
    isDay);
  createCurrentMiscItem(
    data.current.pressure_msl,
    data.current.relative_humidity_2m,
    data.daily.precipitation_probability_max[0],
    data.current.wind_speed_10m,
    data.current.wind_direction_10m,
    sunrise,
    sunset
  );
};

const createCurrentMainItem = (time_now,temp,feels_like,temp_max,temp_min) => {
  const [date, time] = time_now.split("T");
  const currentDate = new Date(date);
  const dayOfWeek = daysOfWeek[currentDate.getDay()];
  const dayOfMonth = currentDate.getDate();
  const month = months[currentDate.getMonth()];
  document.getElementById("day").innerText = dayOfWeek;
  document.getElementById("date").innerText = month + " " + dayOfMonth + ", " + time;
  document.getElementById("temp").innerText = oneDecimal(temp) + "°C";
  document.getElementById("feels-like").innerHTML ='<i class="bi bi-person-fill-exclamation"></i> ' + oneDecimal(feels_like) + "°C";
  document.getElementById("temp-max").innerHTML = '<i class="bi bi-thermometer-high"></i> ' + oneDecimal(temp_max) + "°C";
  document.getElementById("temp-min").innerHTML =
    '<i class="bi bi-thermometer"></i> ' + oneDecimal(temp_min) + "°C";
};

const createCurrentLocationItem = (weather, country, isDay) => {
  const countryImage = document.getElementById("country");
  countryImage.src = `https://flagcdn.com/${country.toLowerCase()}.svg`;
  countryImage.style.width = "30px";
  countryImage.style.height = "15px";
  countryImage.alt = `${country} Flag`;
  const cloud = document.getElementById("cloud");
  const wind = document.getElementById("windy");
  const windyCloud = document.getElementById("windy-cloud");
  const dcloud = document.querySelectorAll(".dcloud");
  const lightning = document.getElementById("lightning");
  const thunder = document.getElementById("thunder");
  const mist = document.querySelectorAll(".mist");
  const rain = document.querySelectorAll(".rain");
  const snow = document.querySelectorAll(".snow");
  const dust = document.querySelectorAll(".dust");
  displayNone(weatherImages);
  let weatherType = weatherFromWMOCode(weather);
  //   weatherType.type = "thunder";
  console.log(isDay);
  const timeOfDay = isDay === 1 ? "sun" : "moon";
  switch (weatherType.type) {
    case "clear":
      document.getElementById(timeOfDay).style.display = "block";
      break;
    case "rain":
      document.getElementById(timeOfDay).style.display = "block";
      cloud.style.marginTop = "100px";
      cloud.style.display = "block";
      displayBlock(rain);
      break;
    case "snow":
      document.getElementById(timeOfDay).style.display = "block";
      document.getElementById(timeOfDay).style.margin = "0 0 80px 100px";
      cloud.style.display = "block";
      cloud.style.marginTop = "40px";
      displayBlock(snow);
      break;
    case "mist":
      document.getElementById(timeOfDay).style.display = "block";
      displayBlock(mist);
      mist[0].style.zIndex = "3";
      mist[1].style.zIndex = "3";
      break;
    case "lightning":
      document.getElementById(timeOfDay).style.display = "block";
      document.getElementById(timeOfDay).style.margin = "0 0 80px 100px";
      dcloud.forEach((img) => {
        img.style.display = "block";
        img.style.zIndex = "3";
      });
      cloud.style.display = "block";
      lightning.style.display = "block";
      break;
    case "dust":
      document.getElementById(timeOfDay).style.display = "block";
      displayBlock(dust);
      dust[0].style.zIndex = "3";
      dust[1].style.zIndex = "3";
      break;
    case "wind":
      document.getElementById(timeOfDay).style.display = "block";
      document.getElementById(timeOfDay).style.margin = "0 0 80px 100px";
      windyCloud.style.display = "block";
      windyCloud.style.marginTop = "40px";
      windyCloud.style.zIndex = "3";
      wind.style.display = "block";
      wind.style.margin = "40px 0 0 50px";
      break;
    case "thunder":
      document.getElementById(timeOfDay).style.display = "block";
      document.getElementById(timeOfDay).style.margin = "0 0 80px 100px";
      displayBlock(dcloud);
      dcloud[0].style.zIndex = "3";
      dcloud[1].style.marginBottom = "40px";
      dcloud[1].style.zIndex = "1";
      cloud.style.display = "block";
      thunder.style.display = "block";
      thunder.style.zIndex = "2";
      break;
    default:
      document.getElementById(timeOfDay).style.display = "block";
      cloud.style.marginTop = "120px";
      cloud.style.display = "block";
  }
  document.getElementById("weather-desc").innerText = weatherType.description;
};

const degreesToCompass = (degrees) => {
    //const compassPoints = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const compassPoints = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
    const index = Math.round(degrees / 22.5);
    return compassPoints[index];
}
const createCurrentMiscItem = (pressure,humidity,precipitation,windSpeed,windDir,sunrise, sunset) => {
  console.log(precipitation);
    document.getElementById("h-name").innerHTML = "<strong>Humidity:</strong>";
  document.getElementById("humidity").innerText = humidity + "%";
  document.getElementById("p-name").innerHTML = "<strong>Pressure:</strong>";
  document.getElementById("pressure").innerText = pressure + "hPa";
  document.getElementById("prec-name").innerHTML = "<strong>Precipitation:</strong>";
  document.getElementById("prec-prob").innerText = precipitation + "%";
  document.getElementById("w-name").innerHTML = "<strong>Wind: </strong>[" + degreesToCompass(windDir)+ "]";
  document.getElementById("wind-speed").innerText = windSpeed + "m/s";
  document.getElementById("sr-name").innerHTML = "<strong>Sunrise:</strong>";
  document.getElementById("sunrise").innerText = sunrise;
  document.getElementById("ss-name").innerHTML = "<strong>Sunset:</strong>";
  document.getElementById("sunset").innerText = sunset;
};

const createDailyWeather = (day,dayOfWeek,month,weather,max,min,isDay) => {
  // const currentShortDay = daysOfWeek[new Date().getDay()].replace(/day|nesday|urday/, '');
  const forecast = document.getElementById("forecast");

  const weatherForecast = document.createElement("div");
  weatherForecast.className = "forecast-container shadow";
  //   if ( currentShortDay === dayOfWeek){
  //     weatherForecast.className = "forecast-container shadow highlight";
  //   }else{
  //   weatherForecast.className = "forecast-container shadow";
  //   }

  const forecastDate = document.createElement("div");
  forecastDate.className = "forecast-date-container";

  const dayName = document.createElement("p");
  dayName.className = "day";
  dayName.innerText = dayOfWeek;
  forecastDate.append(dayName);

  const date = document.createElement("p");
  date.className = "date";
  date.innerText = month + " " + day;
  forecastDate.append(date);

  weatherForecast.append(forecastDate);

  const forecastWeatherContainer = document.createElement("div");
  forecastWeatherContainer.className = "";
  
  const weatherImage = document.createElement("img");
  weatherImage.className = "forecast-image ";
  const weatherType = weatherFromWMOCode(weather);
  const timeOfDay = isDay === 1 ? "sun" : "moon";

  switch (weatherType.type) {
    case "clear":
      weatherImage.src = `/images/forecast-${timeOfDay}.png`;
      break;
    case "rain":
      weatherImage.src = `/images/forecast-${timeOfDay}-rain.png`;
      break;
    case "snow":
      weatherImage.src = "/images/forecast-snow.png";
      break;
    case "mist":
      weatherImage.src = `/images/forecast-${timeOfDay}-mist.png`;
      break;
    case "lightning":
      weatherImage.src = "/images/forecast-lightning.png";
      break;
    case "dust":
      weatherImage.src = `/images/forecast-${timeOfDay}-dust.png`;
      break;
    case "wind":
      weatherImage.src = `/images/forecast-${timeOfDay}-wind.png`;
      break;
    default:
      weatherImage.src = `/images/forecast-${timeOfDay}-cloud.png`;
  }
  forecastWeatherContainer.append(weatherImage);


  const weatherDesc = document.createElement("div");
  weatherDesc.className = "forecast-text-container";
  const weatherDescText = document.createElement("p");
  weatherDescText.innerText = weatherType.description;
  weatherDesc.append(weatherDescText);
  forecastWeatherContainer.append(weatherDesc);
  weatherForecast.append(forecastWeatherContainer);


  const highLow = document.createElement("div");
  highLow.className = "high-low-container";

  const highTemp = document.createElement("p");
  highTemp.className = "high-temp";
  highTemp.innerHTML =
    '<i class="bi bi-thermometer-high" style="margin-right: 5px;"></i><strong>' +
    oneDecimal(max) +
    "°C</strong>";
  highLow.append(highTemp);

  const lowTemp = document.createElement("p");
  lowTemp.className = "low-temp";
  lowTemp.innerHTML =
    '<i class="bi bi-thermometer" style="margin-right: 5px;"></i><strong>' +
    oneDecimal(min) +
    "°C</strong>";
  highLow.append(lowTemp);

  weatherForecast.append(highLow);
  forecast.append(weatherForecast);
};

const groupWeatherByDate = (data, isDay) => {
  for (let i = 0; i < data.daily.time.length; i++) {
    let date = new Date(data.daily.time[i]);
    let day = date.getDate();
    let dayOfWeek = daysOfWeek[date.getDay()].replace(/day|nesday|urday/, "");
    let month = months[date.getMonth()];
    let weatherDesc = data.daily.weather_code[i];
    let maxTemp = data.daily.temperature_2m_max[i];
    let minTemp = data.daily.temperature_2m_min[i];
    createDailyWeather(day,dayOfWeek,month,weatherDesc,maxTemp,minTemp,isDay);
  }
};

let myChart = null;
const createChart = (data) => {
  const times = data.hourly.time.map((time) => time.replace("T", " "));
  const dates = data.daily.time;
  const minTemps = data.daily.temperature_2m_min;
  const maxTemps = data.daily.temperature_2m_max;
  const temps = data.hourly.temperature_2m;

  const duplicatedMinTemps = [];
  const duplicatedMaxTemps = [];
  for (let i = 0; i < temps.length; i++) {
    duplicatedMinTemps.push(minTemps[Math.floor(i / 24)]);
    duplicatedMaxTemps.push(maxTemps[Math.floor(i / 24)]);
  }


  const chartCtx = document.getElementById("forecast-chart").getContext("2d");
  if (myChart !== null) {
    myChart.destroy();
  }
  myChart = new Chart(chartCtx, {
    type: "line",
    data: {
      labels: times,
      datasets: [
        {
          label: "Hourly Temperature (°C)",
          data: temps,
          backgroundColor: "rgb(255,196,0, 0.2)",
          borderColor: "rgb(255,196,0)",
          borderWidth: 1,
        },
        {
          label: "Min Temperature (°C)",
          data: duplicatedMinTemps,
          backgroundColor: "rgb(33,166,255, 0.2)",
          borderColor: "rgb(33,166,255)",
          borderWidth: 1,
        },
        {
          label: "Max Temperature (°C)",
          data: duplicatedMaxTemps,
          backgroundColor: "rgb(255,35,35,0.2)",
          borderColor: "rgb(255,35,35)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
        x: {
          ticks: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
        title: {
          display: true,
          text: "Temperature (°C)",
          color: "white",
        },
      },
      interaction: {
        intersect: false,
        mode: "nearest",
        axis: "x",
      },
    },
  });
};

const resetPage = () => {
  console.log("Resetting");
  const paragraphs = document
    .getElementById("current-temp")
    .querySelectorAll("p:not(.not-found)");
  paragraphs.forEach((paragraph) => {
    paragraph.innerHTML = "";
  });
  document.getElementById("forecast").innerHTML = "";
  myChart.destroy();
};
