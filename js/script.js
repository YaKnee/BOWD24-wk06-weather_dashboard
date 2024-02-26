
const scrollBar = document.getElementById("scroll-bar");
window.addEventListener("scroll", function() {
    //Scrolled Height
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    //Total Height
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    //Height of Screen
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;
    
    const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
    scrollBar.style.width = scrolled + "%";
});


const getInputLocation = (dataType) => {
    try {
        const cityInput = document.querySelector(".city-holder");
        const selectElement = document.getElementById("length-select");
        let lengthInput = selectElement.value;
        const fetchAndUpdate = (lengthInput) => {
            let initialCity = sessionStorage.getItem("currentCity"); 
            if (!initialCity) {
                initialCity = cityInput.placeholder;
            } else {
                cityInput.placeholder = initialCity; 
            }
            fetchGeoLocation(initialCity, dataType, lengthInput);
        };

        selectElement.addEventListener('change', function(event) {
            lengthInput = event.target.value;
            fetchAndUpdate(lengthInput);
        });

        const form = document.querySelector(".city-input");
        form.addEventListener("submit", function(event) {
            event.preventDefault(); 
            const city = cityInput.value;
            sessionStorage.setItem("currentCity", city); 
            cityInput.value = "";
            fetchAndUpdate(lengthInput);
        });
        fetchAndUpdate(selectElement.value);
    } catch (error) {
        console.log(error);
    }
}

const fetchGeoLocation = async (city, dataType, lengthInput) => {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        const data = await response.json();
        displayLocation(data, dataType, lengthInput);
        //console.log(data);
    } catch (error) {
        console.log(error);
    }
}

const displayLocation = (data, dataType, lengthInput) => {
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
    countryCode.style.width = "80px";
    countryCode.style.height = "50px";
    countryCode.alt = `${data.results[0].country} Flag`;
    countryCode.className = "col-2";
    halfTwo.append(countryCode);


    location.append(halfOne);
    location.append(halfTwo);
    sessionStorage.setItem("latitude", lat);
    sessionStorage.setItem("longitude", long);
    fetchWeatherData(lat, long, encodeURIComponent(timezone), dataType, lengthInput);
}


const fetchWeatherData = async(lat, long, timezone, dataType, lengthInput) => {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&wind_speed_unit=ms&timezone=${timezone}&forecast_days=1&past_days=${lengthInput}`)
        const data = await response.json();
        console.log(data);
        if (dataType === 'temp') {
            displayData(data, "Temperature (°C)", "temperature_2m", "rgb(255,99,132)", "rgb(255,99,132,0.2)");
        }
        if (dataType === 'wind') {
            displayData(data, "Wind Speed (m/s)", "wind_speed_10m", "rgb(91,209,132)", "rgb(91,209,132,0.2)");
        }
        if (dataType === 'humidity') {
            displayData(data, "Humidity (%)", "relative_humidity_2m", "rgb(91,99,132)", "rgb(91,99,132,0.2)");
        } 
    } catch (error) {
        console.error(error);
    }
}
const displayData = (data, title, reading, lineColor, bgColor) => {
    const dataTable = document.querySelector(".data-table");
    const table = createDataTable(title);
    for (let i = 0; i < data.hourly.time.length; i++) {
        addDataRow(table, i, data.hourly.time, data.hourly[reading]);
    }
    dataTable.append(table);
    createChart(title, data.hourly[reading], data.hourly.time, lineColor, bgColor);
    fetchSevenDay(data.latitude, data.longitude, reading);
}

const createDataTable = (headerText) => {
    const tableElement = document.createElement("table");
    tableElement.style.width = "100%";
    tableElement.classList = "text-center table-layout";
    const tableHead = document.createElement("tr");
    const headers = ["#", "Date", "Time", headerText];
    headers.forEach(header => {
        const headerElement = document.createElement("th");
        headerElement.innerText = header;
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

let myChart = null;
const createChart = (label, data, dateTimes, lineColor, fillColor) => {
    //console.log(dateTimes);
    let { dateArray, timeArray } = createDateAndTimeArrays(dateTimes);
    const times = dateTimes.map(time => time.replace("T", " "));
    const chartCtx = document.querySelector(".my-charts").getContext("2d");
    if(times.length > 100) {
        timeArray = dateArray;
    }
    myChart = new Chart(chartCtx, {
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
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                }
            },
            plugins: {
                legend: {
                    display: false,
                    position: "bottom",
                },
                title: {
                    display: true,
                    text: label,
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

///////////////////////////////////////////////////////////////////////////////////////////////
//-----------------------------------STATISTICS------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////


const fetchSevenDay = async(lat, long, dataType) => {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=${dataType}&wind_speed_unit=ms&timezone=auto&past_days=6&forecast_days=1` )
        const data = await response.json();
        // console.log(data);
        createStatistics(data, dataType);
    } catch (error) {
        console.error(error);
    }
}

let statChart = null;
const createStatistics = (data, dataType) => {
    const array = data.hourly[dataType];
    const ctx = document.querySelector(".statistics").getContext('2d');
    const statLabels = ['Mean', 'Median', 'Mode', 'Range', 'Standard Deviation', 'Max', 'Min'];
    const statData = [mean(array), median(array), mode(array), range(array), std(array), max(array), min(array)];
    const bgColor = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(0, 128, 0, 0.2)' 
      ];
    const lineColor = [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)',
        'rgb(0, 128, 0)'
      ];
    statChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: statLabels,
        datasets: [{
          //label: 'Statistics',
          data: statData,
          backgroundColor: bgColor,
          borderColor: lineColor,
          borderWidth: 1,
          borderRadius: 5,
        }]
      },
      options: {
        scales: {
            y: {
                beginAtZero: true,
            },
            x: {
                beginAtZero: false
            }
        },
        plugins: {
            legend: {
                display:false,
                position: "bottom",
            },
            title: {
                display: true,
                text: "Statistics of Last 7 Days (Inclusive):"
            },
        }
      }
    });
    createStatTable(statLabels, statData, lineColor);
}

const createStatTable = (statLabels, statData, bgColor) => {
    // const statTable = document.getElementById(tableId);
    const statTable = document.querySelector(".stat-table");
    statTable.innerHTML = "";
    const labelRow = document.createElement('tr');
    const dataRow = document.createElement('tr');
    
    for (let i = 0; i < statLabels.length; i++) {
        const labelCell = document.createElement('th');
        labelCell.innerText = statLabels[i]; 
        labelCell.style.backgroundColor = bgColor[i];
        const dataCell = document.createElement('td');
        dataCell.innerText = statData[i]; 
        labelRow.append(labelCell);
        dataRow.append(dataCell);
    }
    
    statTable.append(labelRow);
    statTable.append(dataRow);
}

///////////////////////////////////////////////////////////////////////////////////////////////
//-----------------------------------MISC------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////

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


const clearPage = () => {
    document.querySelector(".location-details").innerHTML = "";
    document.querySelector(".data-table").innerHTML = "";
    if (statChart!== null) {
        statChart.destroy();
    }
    if (myChart !== null) {
        myChart.destroy();
    }
}