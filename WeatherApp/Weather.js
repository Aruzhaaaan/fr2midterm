const apiKey = "f1f203669a95c6c38d032247a5de33ad";
const unitToggle = document.getElementById('unit-toggle');
let isCelsius = true; 
const getWeatherData = async (city) => {
    const unit = isCelsius ? 'metric' : 'imperial'; 
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`);
    const data = await response.json();
    return data;
};

const getForecastData = async (city) => {
    const unit = isCelsius ? 'metric' : 'imperial'; 
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`);
    const data = await response.json();
    return data.list.filter((_, index) => index % 8 === 0); 
};

const updateWeatherDisplay = (data) => {
    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('current-temp').textContent = `${data.main.temp}° ${isCelsius ? 'C' : 'F'}`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${data.wind.speed} m/s`;
    document.getElementById('weather-icon').innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}" />`;
};

const updateForecastDisplay = (forecast) => {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';
    forecast.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('forecast-item');
        dayElement.innerHTML = `
            <p>${new Date(day.dt_txt).toLocaleDateString()}</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}" />
            <p>${day.main.temp_max}° / ${day.main.temp_min}° ${isCelsius ? 'C' : 'F'}</p>
        `;
        forecastContainer.appendChild(dayElement);
    });
};

const handleSearch = async () => {
    const city = document.getElementById('city-search').value;
    if (city) {
        const weatherData = await getWeatherData(city);
        const forecastData = await getForecastData(city);
        updateWeatherDisplay(weatherData);
        updateForecastDisplay(forecastData);
    }
};

const handleLocation = async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const unit = isCelsius ? 'metric' : 'imperial';
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${apiKey}`);
            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${apiKey}`);
            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();
            updateWeatherDisplay(weatherData);
            updateForecastDisplay(forecastData.list.filter((_, index) => index % 8 === 0));
        });
    } else {
        alert('Geolocation not supported');
    }
};

const toggleUnits = () => {
    isCelsius = !isCelsius;
    const city = document.getElementById('city-search').value;
    if (city) {
        handleSearch();
    }
};

document.getElementById('get-weather-btn').addEventListener('click', handleSearch);
document.getElementById('get-location').addEventListener('click', handleLocation);
unitToggle.addEventListener('change', toggleUnits);
