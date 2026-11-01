
/* =====================================
   1. HTML Elements
===================================== */

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const dateElement = document.getElementById("date");

const temperature = document.getElementById("temperature");
const weatherIcon = document.getElementById("weatherIcon");
const weatherDescription = document.getElementById("weatherDescription");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

const forecastContainer = document.getElementById("forecastContainer");


/* =====================================
   2. Weather Code Mapping
===================================== */

function getWeatherInfo(code) {

    const weatherCodes = {
        0: ["Clear Sky", "☀️"],
        1: ["Mainly Clear", "🌤️"],
        2: ["Partly Cloudy", "⛅"],
        3: ["Overcast", "☁️"],
        45: ["Foggy", "🌫️"],
        48: ["Depositing Rime Fog", "🌫️"],
        51: ["Light Drizzle", "🌦️"],
        53: ["Moderate Drizzle", "🌦️"],
        55: ["Dense Drizzle", "🌧️"],
        61: ["Slight Rain", "🌧️"],
        63: ["Moderate Rain", "🌧️"],
        65: ["Heavy Rain", "⛈️"],
        71: ["Slight Snow", "🌨️"],
        73: ["Moderate Snow", "❄️"],
        75: ["Heavy Snow", "❄️"],
        80: ["Rain Showers", "🌦️"],
        81: ["Moderate Showers", "🌧️"],
        82: ["Violent Showers", "⛈️"],
        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm with Hail", "⛈️"],
        99: ["Thunderstorm with Heavy Hail", "⛈️"]
    };

    return weatherCodes[code] || ["Unknown Weather", "🌡️"];
}


/* =====================================
   3. Get City Coordinates
===================================== */

async function getCityCoordinates(city) {

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to find city.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please enter a valid city name.");
    }

    return data.results[0];
}


/* =====================================
   4. Get Weather Data
===================================== */

async function getWeather(city) {

    try {

        if (!city.trim()) {
            alert("Please enter a city name!");
            return;
        }

        searchBtn.disabled = true;
        searchBtn.textContent = "Loading...";

        cityName.textContent = "Loading weather...";
        weatherDescription.textContent = "Fetching latest data...";

        const location = await getCityCoordinates(city);

        const latitude = location.latitude;
        const longitude = location.longitude;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const data = await response.json();

        displayWeather(location, data);

        displayForecast(data.daily);

    }

    catch (error) {

        cityName.textContent = "Weather Unavailable";
        weatherDescription.textContent = error.message;

        forecastContainer.innerHTML = "<p>Unable to load forecast.</p>";

        temperature.textContent = "--°C";
        feelsLike.textContent = "--°C";
        humidity.textContent = "--%";
        windSpeed.textContent = "-- km/h";
        weatherIcon.textContent = "❓";

    }

    finally {

        searchBtn.disabled = false;
        searchBtn.textContent = "Search";

    }
}


/* =====================================
   5. Display Current Weather
===================================== */

function displayWeather(location, data) {

    const current = data.current;

    const weather = getWeatherInfo(current.weather_code);

    cityName.textContent =
        `${location.name}, ${location.admin1 || location.country}`;

    dateElement.textContent = new Date(current.time)
        .toLocaleString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit"
        });

    temperature.textContent =
        `${Math.round(current.temperature_2m)}°C`;

    weatherIcon.textContent = weather[1];

    weatherDescription.textContent = weather[0];

    feelsLike.textContent =
        `${Math.round(current.apparent_temperature)}°C`;

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${current.wind_speed_10m} km/h`;

}


/* =====================================
   6. Display 5-Day Forecast
===================================== */

function displayForecast(daily) {

    forecastContainer.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {

        const weather = getWeatherInfo(daily.weather_code[i]);

        const date = new Date(daily.time[i] + "T00:00:00");

        const day = date.toLocaleDateString("en-IN", {
            weekday: "short"
        });

        const card = document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <h3>${day}</h3>

            <div class="forecast-icon">
                ${weather[1]}
            </div>

            <p>${weather[0]}</p>

            <h3>
                ${Math.round(daily.temperature_2m_max[i])}° /
                ${Math.round(daily.temperature_2m_min[i])}°
            </h3>
        `;

        forecastContainer.appendChild(card);

    }

}


/* =====================================
   7. Search Button Event
===================================== */

searchBtn.addEventListener("click", function () {

    getWeather(cityInput.value);

});


/* =====================================
   8. Enter Key Event
===================================== */

cityInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {

        getWeather(cityInput.value);

    }

});


/* =====================================
   9. Default City
===================================== */

getWeather("Pune");
