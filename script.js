document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'e51e2bff7c83d951de5f6e8aec4d9db0'; // OpenWeatherMap API key
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const weatherIcon = document.querySelector('.weather-icon i');
    const temperature = document.getElementById('temp');
    const description = document.getElementById('weather-desc');
    const humidity = document.getElementById('humidity-value');
    const windSpeed = document.getElementById('wind-speed');
    const errorMessage = document.querySelector('.error-message');
  
    const weatherIcons = {
      'Clear': 'fa-sun',
      'Clouds': 'fa-cloud',
      'Rain': 'fa-cloud-rain',
      'Snow': 'fa-snowflake',
      'Thunderstorm': 'fa-bolt',
      'Drizzle': 'fa-cloud-rain',
      'Mist': 'fa-smog',
      'Smoke': 'fa-smog',
      'Haze': 'fa-smog',
      'Dust': 'fa-smog',
      'Fog': 'fa-smog',
      'Sand': 'fa-smog',
      'Ash': 'fa-smog',
      'Squall': 'fa-wind',
      'Tornado': 'fa-wind'
    };
  
    async function getWeatherData(city) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
  
        if (!response.ok) {
          throw new Error('City not found');
        }
  
        const data = await response.json();
        updateWeatherUI(data);
        errorMessage.style.display = 'none';
  
        // Prepare data to send to Salesforce
        const weatherData = {
          City__c: data.name,
          Temperature__c: data.main.temp,
          Humidity__c: data.main.humidity,
          Condition__c: data.weather[0].description,
          Date__c: new Date().toISOString(),
          Alert_Triggered__c: data.main.temp > 35
        };
  
        sendDataToSalesforce(weatherData);
  
      } catch (error) {
        errorMessage.style.display = 'block';
        resetWeatherUI();
      }
    }
  
    function updateWeatherUI(data) {
      const weatherMain = data.weather[0].main;
      const iconClass = weatherIcons[weatherMain] || 'fa-cloud';
  
      weatherIcon.className = `fas ${iconClass}`;
      temperature.textContent = Math.round(data.main.temp);
      description.textContent = data.weather[0].description;
      humidity.textContent = data.main.humidity;
      windSpeed.textContent = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
    }
  
    function resetWeatherUI() {
      weatherIcon.className = 'fas fa-cloud';
      temperature.textContent = '--';
      description.textContent = '--';
      humidity.textContent = '--';
      windSpeed.textContent = '--';
    }
  
    searchBtn.addEventListener('click', () => {
      const city = cityInput.value.trim();
      if (city) {
        getWeatherData(city);
      }
    });
  
    cityInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
          getWeatherData(city);
        }
      }
    });
  
    // Initial weather data for a default city
    getWeatherData('London');
  
    // Send data to Salesforce
    function sendDataToSalesforce(weatherData) {
        const accessToken = 'your_access_token_here';
        const instanceUrl = 'https://your_instance.salesforce.com';
        
  
      fetch(`${instanceUrl}/services/data/v59.0/sobjects/Weather_Data__c`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(weatherData)
      })
      .then(response => response.json())
      .then(data => {
        console.log("✅ Weather data sent to Salesforce:", data);
      })
      .catch(error => {
        console.error("❌ Error sending data to Salesforce:", error);
      });
    }
  });
  