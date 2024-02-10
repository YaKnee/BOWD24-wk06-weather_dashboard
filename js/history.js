const getDateLimit = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() - 5);
    const formattedMaxDate = maxDate.toISOString().split('T')[0];
    const start = document.getElementById("start");
    start.max = formattedMaxDate;
    start.value = formattedMaxDate;
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
        const fetchAndUpdate = (startInput, endInput, dataInput) => {
            let initialCity = sessionStorage.getItem("currentCity"); 
            if (!initialCity) {
                initialCity = cityInput.placeholder;
            } else {
                cityInput.placeholder = initialCity; 
            }
            fetchGeoLocation(initialCity, dataInput, startInput, endInput);
        };

        dataElement.addEventListener("change", function(event) {
            dataInput = event.target.value;
            fetchAndUpdate(startInput, endInput, dataInput);
        })

        document.getElementById("submit").addEventListener("click", function(event) {
            const startInput = document.getElementById("start").value;
            const endInput = document.getElementById("end").value;
            fetchAndUpdate(startInput, endInput, dataInput);
        });
        const form = document.querySelector(".city-input");
        form.addEventListener("submit", function(event) {
            event.preventDefault(); 
            const city = cityInput.value;
            sessionStorage.setItem("currentCity", city); 
            cityInput.value = "";
            fetchAndUpdate(startInput, dataInput);
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
    //countryCode.src = `https://flagsapi.com/${data.results[0].country_code}/flat/64.png`;
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
        // displayData(data);
    } catch (error) {
        console.error(error);
    }
}


const clearPage = () => {
    document.querySelector(".location-details").innerHTML = "";
    document.querySelector(".data-table").innerHTML = "";
}