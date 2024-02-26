
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


const getDateLimit = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() - 5);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 12);
    const formattedMaxDate = maxDate.toISOString().split('T')[0];
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const start = document.getElementById("start");
    start.max = formattedStartDate;
    start.value = formattedStartDate;
    const end = document.getElementById("end");
    end.max = formattedMaxDate;
    end.value = formattedMaxDate;
}
getDateLimit();

const getInputLocation = () => {
    try {
        const cityInput = document.querySelector(".city-holder");
        const startElement = document.getElementById("start");
        let startInput = startElement.value;
        const endElement = document.getElementById("end");
        let endInput = endElement.value;
        const dataElement = document.getElementById("data-type");
        let dataInput = dataElement.value;
        const fetchAndUpdate = async (startInput, endInput, dataInput) => {
            let initialCity = sessionStorage.getItem("currentCity"); 
            if (!initialCity) {
                initialCity = cityInput.placeholder;
            } else {
                cityInput.placeholder = initialCity; 
            }
            await fetchGeoLocation(initialCity, dataInput, startInput, endInput);
        };

        dataElement.addEventListener("change", function(event) {
            dataInput = event.target.value;
            fetchAndUpdate(startInput, endInput, dataInput);
        })

        document.getElementById("submit").addEventListener("click", function(event) {
            startInput = document.getElementById("start").value;
            endInput = document.getElementById("end").value;
            fetchAndUpdate(startInput, endInput, dataInput);
        });
        const form = document.querySelector(".city-input");
        form.addEventListener("submit", function(event) {
            event.preventDefault(); 
            const city = cityInput.value;
            sessionStorage.setItem("currentCity", city); 
            cityInput.value = "";
            fetchAndUpdate(startInput, endInput, dataInput);
        });
        fetchAndUpdate(startInput, endInput, dataInput);
    } catch (error) {
        console.log(error);
    }
}
// getInputLocation();

const fetchGeoLocation = async (city, dataType, startInput, endInput) => {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        const data = await response.json();
        displayLocation(data, dataType, startInput, endInput);
        //console.log(data);
    } catch (error) {
        console.log(error);
    }
}

const displayLocation = (data, dataType, startInput, endInput) => {
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
    fetchWeatherData(lat, long, encodeURIComponent(timezone), dataType, startInput, endInput);
}

const fetchWeatherData = async(lat, long, timezone, dataType, startInput, endInput) => {
    try {
        const response = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${long}&start_date=${startInput}&end_date=${endInput}&daily=${dataType}&wind_speed_unit=ms&timezone=${timezone}`)
        const data = await response.json();
        console.log(data);
        const title = weatherTitleFromReading(dataType);
        displayData(data, title, data.daily[dataType]);
        createChart(data, title, dataType);
    } catch (error) {
        console.error(error);
    }
}


const clearPage = () => {
    document.querySelector(".location-details").innerHTML = "";
    document.querySelector(".data-table").innerHTML = "";
    if (myChart !== null) {
        myChart.destroy();
    }
}

const displayData = (data, title, reading, startIndex = 0) => {
    const dataTable = document.querySelector(".data-table");
    const table = createDataTable(title.title);
    const endIndex = Math.min(startIndex + 500, data.daily.time.length);
    if(title.title === "Sunshine Hours") {
        reading = reading.map(seconds => (seconds/3600).toFixed(2));
    }
    for (let i = startIndex; i < endIndex; i++) {
        addDataRow(table, i, data.daily.time, reading);
    }
    dataTable.append(table);

    // Check if there's more data to load
    if (endIndex < data.daily.time.length) {
        // Add a button to load more data
        const loadMoreButton = document.createElement("button");
        loadMoreButton.innerText = "Load More";
        loadMoreButton.style.marginTop = "5px";
        loadMoreButton.className = "btn btn-primary";
        loadMoreButton.addEventListener("click", () => {
            dataTable.removeChild(loadMoreButton);
            
            displayData(data, title, reading, endIndex);
        });
        dataTable.append(loadMoreButton);
    }
}
const weatherTitleFromReading = (title) => {
    const weatherDataMap = {
        "temperature_2m_mean": {title: "Average Temperature (°C)", color:["rgb(255,196,0, 0.2)", "rgb(255,196,0)"] },
        "temperature_2m_min": {title: "Minimum Temperature (°C)", color:["rgb(33,166,255, 0.2)","rgb(33,166,255)"] },
        "temperature_2m_max": {title: "Maximum Temperature (°C)", color:["rgb(255,35,35,0.2)", "rgb(255,35,35)"] },
        "wind_speed_10m_max": {title: "Wind Speed (m/s)", color: ["rgb(91,209,132,0.2)", "rgb(91,209,132)"]},
        "wind_gusts_10m_max": {title: "Wind Gusts (m/s)", color:  ["rgb(91,209,132,0.2)", "rgb(91,209,132)"]},
        "sunshine_duration": {title: "Sunshine Hours", color:["rgb(255,196,0, 0.2)", "rgb(255,196,0)"]},
        "precipitation_sum": {title: "Precipitation Sum (mm)", color: ["rgb(127,233,255,0.2)","rgb(56,221,255)"]},
        "precipitation_hours": {title:"Precipitation Hours", color: ["rgb(127,233,255,0.2)","rgb(56,221,255)"]},
        "shortwave_radiation_sum": {title:"Shortwave Radiation Sum (MJ/m²)", color:["rgb(213,114,224,0.2","rgb(213,114,224"]},
    };

    return weatherDataMap[title] || { type: "unknown", description: "Unknown Weather" };
};

const createDataTable = (title) => {
    const tableElement = document.createElement("table");
    tableElement.style.width = "100%";
    tableElement.className = "text-center table-layout"
    const tableHead = document.createElement("tr");


    const headers = ["#", "Date", title];
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

    const colOne = document.createElement("td");
    colOne.innerText = index + 1;

    const colTwo = document.createElement("td");
    colTwo.innerText = rearrangeDate(time[index]);

    const colThree = document.createElement("td");
    colThree.innerText = dataSet[index];

    tableRow.append(colOne);
    tableRow.append(colTwo);
    tableRow.append(colThree);

    table.append(tableRow);
}


let myChart = null;
const createChart = (data, title, dataType) => {
    const graphLimit = document.getElementById("graph-limit");
    let limit = graphLimit.value;

    graphLimit.addEventListener("change", function(event) {
        limit = event.target.value;
        updateChart();
    });

    const chartCtx = document.querySelector(".my-charts").getContext("2d");
    const updateChart = () => {
        let times, readings;

        if (data.daily.time.length > limit) {
            const step = Math.ceil(data.daily.time.length / limit);
            times = data.daily.time.filter((_, index) => index % step === 0);
            readings = data.daily[dataType].filter((_, index) => index % step === 0);
        } else {
            times = data.daily.time;
            readings = data.daily[dataType];
        }

        if(dataType === "sunshine_duration") {
            readings = readings.map(time => (time/3600).toFixed(2));
        }
        if (myChart !== null) {
            myChart.destroy();
        }

        myChart = new Chart(chartCtx, {
            type: "line",
            data: {
                labels: times,
                datasets: [{
                    //label: dataType,
                    data: readings,
                    backgroundColor: title.color[0],
                    borderColor: title.color[1],
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
                        text: title.title,
                    },
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest',
                    axis: "x",
                }

            }
        });
    }

    updateChart();
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
