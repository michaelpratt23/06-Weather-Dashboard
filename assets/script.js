console.log("script.js loaded");

// Your OpenWeatherMap API key
const apiKey = "087e5b6fa710d354d68642c76b0b612d";

// DOM Elements
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const currentWeatherDiv = document.getElementById("current-weather-details");
const forecastCardsDiv = document.getElementById("forecast-cards");
const historyList = document.getElementById("history-list");

// Fetch geographical coordinates based on city name
async function geCoordinates(city) {
  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
  );
  const data = await response.json();
  if (data.length === 0) throw new Error("City not found");
  return { lat: data[0].lat, lon: data[0].lon };
}

// Fetch weather data using coordinates
async function getWeather(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );
  const data = await response.json();
  return data;
}

// Display current weather and 5-day forecast
function displayWeather(data) {
  // Current weather
  const current = data.list[0];
  currentWeatherDiv.innerHTML = `
    <p><strong>City:</strong> ${data.city.name}</p>
    <p><strong>Date:</strong> ${new Date(current.dt_txt).toDateString()}</p>
    <p><strong>Temperature:</strong> ${current.main.temp} °C</p>
    <p><strong>Wind Speed:</strong> ${current.wind.speed} m/s</p>
    <p><strong>Humidity:</strong> ${current.main.humidity}%</p>
  `;

  // 5-day forecast
  forecastCardsDiv.innerHTML = ""; // Clear old forecast data
  data.list.forEach((forecast, index) => {
    if (index % 8 === 0) {
      // Show one forecast per day (every 8th entry)
      const card = document.createElement("div");
      card.classList.add("forecast-card");
      card.innerHTML = `
        <p><strong>Date:</strong> ${new Date(
          forecast.dt_txt
        ).toDateString()}</p>
        <p><strong>Temp:</strong> ${forecast.main.temp} °C</p>
        <p><strong>Wind:</strong> ${forecast.wind.speed} m/s</p>
        <p><strong>Humidity:</strong> ${forecast.main.humidity}%</p>
      `;
      forecastCardsDiv.appendChild(card);
    }
  });
}

// Save search history to localStorage
function saveSearchHistory(city) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  if (!history.includes(city)) history.push(city); // Avoid duplicates
  localStorage.setItem("searchHistory", JSON.stringify(history));
  displayHistory();
}

// Display search history
function displayHistory() {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  historyList.innerHTML = ""; // Clear old history
  history.forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => {
      cityInput.value = city;
      searchBtn.click(); // Trigger a search when a city in history is clicked
    });
    historyList.appendChild(li);
  });
}

// Event listener for search button
searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim(); // Get user input
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  try {
    const { lat, lon } = await geCoordinates(city); // Get coordinates
    const weatherData = await getWeather(lat, lon); // Get weather data
    displayWeather(weatherData); // Display the weather
    saveSearchHistory(city); // Save to history
  } catch (error) {
    console.error(error);
    alert("Error fetching city data: " + error.message);
  }
});

// Load search history on page load
window.addEventListener("load", displayHistory);
