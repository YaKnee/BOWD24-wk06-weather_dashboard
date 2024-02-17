const weatherCodes = {
    "00-03" : { type: "clear", description: "Clear Sky"},
    "04-05" : { type: "cloud", description: "Cloudy" },
    "06-09" :{ type: "dust", description: "Dusty"},
    "10-12": { type: "mist", description: "Misty Patches" },
    "13" : { type: "lightning", description: "Lightning" },
    "14-16" : { type: "rain", description: "Approaching Rain" },
    "17" : { type: "thunder", description: "Thunderstorm" },
    "18-19" : { type: "wind", description: "High Winds" },
    "20-21": { type: "rain", description: "Rainy Drizzle" },
    "22-24": { type: "snow", description: "Snowy" },
    "25": { type: "rain", description: "Rain Showers" },
    "26-27": { type: "snow", description: "Snow Showers" },
    "28": { type: "mist", description: "Fog" },
    "29": { type: "thunder", description: "Thunderstorm" },
    "30-32": { type: "dust", description: "Slight Duststorm" },
    "33-35": { type: "dust", description: "Severe Duststorm" },
    "36" : { type: "snow", description: "Slight Blowing Snow" },
    "37" : { type: "snow", description: "Heavy Drifting Snow" },
    "38" : { type: "snow", description: "Slight Blowing Snow" },
    "39" : { type: "snow", description: "Heavy Drifting Snow" },
    "40-49": { type: "mist", description: "Fog: Reduced Visibilty" },
    "50-55": { type: "rain", description: "Drizzling Rain" },
    "56-57": { type: "rain", description: "Drizzling Freezing Rain" },
    "58-59": { type: "rain", description: "Drizzling Rain" },
    "60-65": { type: "rain", description: "Raining" },
    "66-69": { type: "rain", description: "Freezing Rain" },
    "70-71": { type: "snow", description: "Slight Snowfall" },
    "72-73": { type: "snow", description: "Moderate Snowfall" },
    "74-75": { type: "snow", description: "Heavy Snowfall" },
    "76-79": { type: "snow", description: "Light Snow" },
    "80": { type: "rain", description: "Slight Rain Showers" },
    "81": { type: "rain", description: "Moderate Rain Showers" },
    "82": { type: "rain", description: "Heavy Rain Showers" },
    "83-84": { type: "rain", description: "Freezing Rain Showers" },
    "85": { type: "snow", description: "Snow Showers" },
    "86": { type: "snow", description: "Heavy Snow Showers" },
    "87-90": { type: "snow", description: "Showers of Hail" },
    "91": { type: "rain", description: "Slight Rain" },
    "92": { type: "rain", description: "Heavy Rain" },
    "93": { type: "snow", description: "Slight Snow" },
    "94": { type: "snow", description: "Heavy Snow" },
    "95-99": { type: "thunder", description: "Thunderstorm" }
  }
  
  const weatherFromWMOCode = (wmoCode) => {
    for (let key in weatherCodes) {
        if (key.includes("-")) { //if range
            let [start, end] = key.split("-").map(Number);
            if (wmoCode >= start && wmoCode <= end) {
                return weatherCodes[key];
            }
        } else { //if single
            if (wmoCode === parseInt(key)) {
                return weatherCodes[key];
            }
        }
    }
    return { type: "unknown", description: "Unknown Weather" }; 
  }
  