const getInputLocation = (dataType) => {
    try {
        const cityInput = document.querySelector(".city-holder");
        const initialCity = cityInput.placeholder; 
        fetchGeoLocation(initialCity, dataType);

        const form = document.querySelector(".city-input form");
        form.addEventListener("submit", function(event) {
            event.preventDefault(); 
            const cityInput = document.querySelector(".city-holder");
            const city = cityInput.value;
            cityInput.value = "";
            fetchGeoLocation(city, dataType);
        });
    } catch (error) {
        // clearPage();
        // const errorMessage = document.createElement("h1");
        // errorMessage.innerHTML = "City not found. Please try again.";
        
        // const cityInput = document.querySelector(".city-input");
        // cityInput.insertBefore(errorMessage, form);
        
        console.log(error);
    }
}

const fetchGeoLocation = async (city, dataType) => {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        const data = await response.json();
        displayLocation(data, dataType);
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

const clearPage = () => {
    document.querySelector(".location-details").innerHTML = "";
    document.querySelector(".data-table").innerHTML = "";
    // document.getElementById("chart-temp").destroy();
    // document.getElementById("chart-wind").destroy();
    // document.getElementById("chart-humidity").destroy();
}

const displayLocation = (data, dataType) => {
    clearPage();
    const location = document.querySelector(".location-details");
    location.style.width = "100%";
    const halfOne = document.createElement("div");
    halfOne.className = "col-sm-6 d-inline-flex justify-content-around";
    const halfTwo = document.createElement("div");
    halfTwo.className = "col-sm-6 d-inline-flex justify-content-around";

    const cityElement = document.createElement("div");
    const city = data.results[0].name
    cityElement.innerHTML = "<p><strong>City: </strong></p><p>" + city + "</p>";
    cityElement.className = "col-2";
    halfOne.append(cityElement);

    const countryElement = document.createElement("div");
    const country = data.results[0].country;
    countryElement.innerHTML = "<p><strong>Country: </strong></p><p>" + country + "</p>";
    countryElement.className = "col-2";
    halfOne.append(countryElement);
    
    const timezoneElement = document.createElement("div");
    const timezone = data.results[0].timezone;
    timezoneElement.innerHTML = "<p><strong>Timezone:</strong></p><p>" + timezone + "</p>";
    timezoneElement.className = "col-2";
    halfOne.append(timezoneElement);

    const latElement = document.createElement("div");
    const lat = data.results[0].latitude;
    latElement.innerHTML= "<p><strong>Latitude: </strong></p><p>" + lat + "</p>";
    latElement.className = "col-2";
    halfTwo.append(latElement);

    const longElement = document.createElement("div");
    const long = data.results[0].longitude;
    longElement.innerHTML = "<p><strong>Longitude: </strong></p><p>" + long; + "</p>";
    longElement.className = "col-2";
    halfTwo.append(longElement);


    const countryCode = document.createElement("img");
    countryCode.src = `https://flagcdn.com/${(data.results[0].country_code).toLowerCase()}.svg`;
    //countryCode.src = `https://flagsapi.com/${data.results[0].country_code}/flat/64.png`;
    countryCode.style.width = "100px";
    countryCode.style.height = "50px";
    countryCode.alt = `${data.results[0].country} Flag`;
    countryCode.className = "col-2";
    halfTwo.append(countryCode);


    location.append(halfOne);
    location.append(halfTwo);
    fetchWeatherData(lat, long, encodeURIComponent(timezone), dataType);
}


const fetchWeatherData = async(lat, long, timezone, dataType) => {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&wind_speed_unit=ms&timezone=${timezone}&forecast_days=1`)
        const data = await response.json();
        console.log(data);
        if (dataType === 'temp') {
            displayTempData(data);
        }
        if (dataType === 'wind') {
            displayWindData(data);
        }
        if (dataType === 'humidity') {
            displayHumidityData(data);
        } 
    } catch (error) {
        console.error(error);
    }
}

const displayTempData = (data) => {
    const dataTemp = document.getElementById("data-temp");
    const chartTemp = document.getElementById("chart-temp").getContext("2d");
    
    const tableTemp = createDataTable("Temperature &degC");
    for (let i = 0; i < data.hourly.time.length; i++) {
        addDataRow(tableTemp, i, data.hourly.time, data.hourly.temperature_2m);
    }
    dataTemp.append(tableTemp);
    createChart("chart-temp", "Temperature", data.hourly.temperature_2m, data.hourly.time, "rgb(255,99,132)", "rgb(255,99,132,0.2)");
}

const displayWindData = (data) => {
    const dataWind = document.getElementById("data-wind");
    const tableWind = createDataTable("Wind Speed");
    for (let i = 0; i < data.hourly.time.length; i++) {
        addDataRow(tableWind, i,data.hourly.time, data.hourly.wind_speed_10m);
    }
    dataWind.append(tableWind);

    createChart("chart-wind", "Wind Speed", data.hourly.wind_speed_10m, data.hourly.time, "rgb(91,209,132)", "rgb(91,209,132,0.2)");
}
const displayHumidityData = (data) => {
    const dataHumidity = document.getElementById("data-humidity");
    const tableHumidity = createDataTable("Relative Humidity");
    for (let i = 0; i < data.hourly.time.length; i++) {
        addDataRow(tableHumidity, i, data.hourly.time, data.hourly.relative_humidity_2m);
    }
    dataHumidity.append(tableHumidity);
    createChart("chart-humidity", "Relative Humidity", data.hourly.relative_humidity_2m, data.hourly.time, "rgb(91,99,132)", "rgb(91,99,132,0.2)");
}

const createChart = (canvasId, label, data, dateTimes, lineColor, fillColor) => {
    console.log(dateTimes);
    const { dateArray, timeArray } = createDateAndTimeArrays(dateTimes);
    const chartCtx = document.getElementById(canvasId).getContext("2d");

    const myChart = new Chart(chartCtx, {
        type: "line",
        data: {
            labels: timeArray,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: fillColor,
                borderColor: lineColor,
                borderWidth: 1,
                fill: "origin",
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                },
                title: {
                    display: true,
                    text: rearrangeDate(dateArray[0]),
                },
            }
        }
    });
};

const createDateAndTimeArrays = (timestamps) => {
    const dateArray = [];
    const timeArray = [];
    
    timestamps.forEach(dateTime => {
        const [date, time] = dateTime.split('T');
        dateArray.push(date);
        timeArray.push(time);
    });

    return { dateArray, timeArray };
};

const createDataTable = (headerText) => {
    const tableElement = document.createElement("table");
    tableElement.style.width = "100%";
    tableElement.style.textAlign = "center";

    const tableHead = document.createElement("tr");
    const headers = ["#", "Date", "Time", headerText];
    headers.forEach(header => {
        const headerElement = document.createElement("th");
        headerElement.innerHTML = `<strong>${header}</strong>`;
        tableHead.append(headerElement);
    });
    tableElement.append(tableHead);

    return tableElement;
}


const addDataRow = (table, index, time, dataSet) => {
    const tableRow = document.createElement("tr");
    const [dateComp, timeComp] = time[index].split("T");

    const colOne = document.createElement("td");
    colOne.innerText = index + 1;

    const colTwo = document.createElement("td");
    colTwo.innerText = rearrangeDate(dateComp);

    const colThree = document.createElement("td");
    colThree.innerText = timeComp;

    const colFour = document.createElement("td");
    colFour.innerText = dataSet[index];

    tableRow.append(colOne);
    tableRow.append(colTwo);
    tableRow.append(colThree);
    tableRow.append(colFour);

    table.append(tableRow);
}


const rearrangeDate = (dateString) => {
    let [year, month, day] = dateString.split("-");
    month = new Date(dateString).toLocaleString("default", { month: "short" });
    day = parseInt(day);
    let suffix = "";
    if (day === 1 || day === 21 || day === 31) {
        suffix = "st";
    } else if (day === 2 || day === 22) {
        suffix = "nd";
    } else if (day === 3 || day === 23) {
        suffix = "rd";
    } else {
        suffix = "th";
    }
    return `${day}${suffix} ${month} ${year}`;
}
