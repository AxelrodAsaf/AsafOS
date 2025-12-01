export function fetchWeatherData(city) {
  const apiKey = 'your_api_key';
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const temperature = document.getElementById('temperature');
      const weatherDescription = document.getElementById('weather-description');
      const weatherIcon = document.getElementById('weather-icon');

      if (temperature && weatherDescription && weatherIcon) {
        const tempCelsius = (data.main.temp - 273.15).toFixed(1);
        temperature.textContent = `${tempCelsius}°C`;
        weatherDescription.textContent = data.weather[0].description;

        const iconCode = data.weather[0].icon;
        weatherIcon.src = `http://openweathermap.org/img/wn/${iconCode}.png`;
      } else {
        console.error('Weather info elements not found');
      }
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
    });
}

// +===== Get Weather information =====+
// function getWeather(city) {
//   const apiKey = "6367cfbb689a28190bcd5a74e0ea3b8a";
//   const colorMap = {
//     200: 'linear-gradient(25deg, #fd1d1d, #833ab4)',
//     201: 'linear-gradient(0deg, rgba(200, 0, 255, 1), rgba(100, 0, 100, 1))',
//     202: 'linear-gradient(0deg, rgba(200, 0, 255, 1), rgba(100, 0, 100, 1))',
//     210: 'linear-gradient(0deg, rgba(200, 0, 255, 1), rgba(100, 0, 100, 1))',
//     211: 'linear-gradient(0deg, rgba(200, 0, 255, 1), rgba(100, 0, 100, 1))',
//     212: 'linear-gradient(0deg, rgba(200, 0, 255, 1), rgba(100, 0, 100, 1))',
//     221: 'linear-gradient(0deg, rgba(200, 0, 255, 1), rgba(100, 0, 100, 1))',
//     230: 'linear-gradient(0deg, rgba(200, 0, 255, 1), rgba(100, 0, 100, 1))',
//     231: 'linear-gradient(0deg, rgba(200, 0, 255, 1), rgba(100, 0, 100, 1))',
//     232: 'linear-gradient(0deg, rgba(200, 0, 255, 1), rgba(100, 0, 100, 1))',
//     300: 'linear-gradient(0deg, rgba(100, 100, 255, 1), rgba(200, 200, 200, 1))',
//     301: 'linear-gradient(0deg, rgba(100, 100, 255, 1), rgba(200, 200, 200, 1))',
//     302: 'linear-gradient(0deg, rgba(100, 100, 255, 1), rgba(200, 200, 200, 1))',
//     310: 'linear-gradient(0deg, rgba(100, 100, 255, 1), rgba(200, 200, 200, 1))',
//     311: 'linear-gradient(0deg, rgba(100, 100, 255, 1), rgba(200, 200, 200, 1))',
//     312: 'linear-gradient(0deg, rgba(100, 100, 255, 1), rgba(200, 200, 200, 1))',
//     313: 'linear-gradient(0deg, rgba(100, 100, 255, 1), rgba(200, 200, 200, 1))',
//     314: 'linear-gradient(0deg, rgba(100, 100, 255, 1), rgba(200, 200, 200, 1))',
//     321: 'linear-gradient(0deg, rgba(100, 100, 255, 1), rgba(200, 200, 200, 1))',
//     500: 'linear-gradient(0deg, rgba(0, 0, 150, 1), rgba(150, 150, 150, 1))',
//     501: 'linear-gradient(0deg, rgba(0, 0, 150, 1), rgba(150, 150, 150, 1))',
//     502: 'linear-gradient(0deg, rgba(0, 0, 150, 1), rgba(150, 150, 150, 1))',
//     503: 'linear-gradient(0deg, rgba(0, 0, 150, 1), rgba(150, 150, 150, 1))',
//     504: 'linear-gradient(0deg, rgba(0, 0, 150, 1), rgba(150, 150, 150, 1))',
//     511: 'linear-gradient(0deg, rgba(0, 0, 150, 1), rgba(150, 150, 150, 1))',
//     520: 'linear-gradient(0deg, rgba(0, 0, 150, 1), rgba(150, 150, 150, 1))',
//     521: 'linear-gradient(0deg, rgba(0, 0, 150, 1), rgba(150, 150, 150, 1))',
//     522: 'linear-gradient(0deg, rgba(0, 0, 150, 1), rgba(150, 150, 150, 1))',
//     531: 'linear-gradient(0deg, rgba(0, 0, 150, 1), rgba(150, 150, 150, 1))',
//     600: 'linear-gradient(0deg, rgba(200, 200, 200, 1), rgba(250, 250, 250, 1))',
//     601: 'linear-gradient(0deg, rgba(200, 200, 200, 1), rgba(250, 250, 250, 1))',
//     602: 'linear-gradient(0deg, rgba(200, 200, 200, 1), rgba(250, 250, 250, 1))',
//     611: 'linear-gradient(0deg, rgba(200, 200, 200, 1), rgba(250, 250, 250, 1))',
//     612: 'linear-gradient(0deg, rgba(200, 200, 200, 1), rgba(250, 250, 250, 1))',
//     613: 'linear-gradient(0deg, rgba(200, 200, 200, 1), rgba(250, 250, 250, 1))',
//     615: 'linear-gradient(0deg, rgba(200, 200, 200, 1), rgba(250, 250, 250, 1))',
//     616: 'linear-gradient(0deg, rgba(200, 200, 200, 1), rgba(250, 250, 250, 1))',
//     620: 'linear-gradient(0deg, rgba(200, 200, 200, 1), rgba(250, 250, 250, 1))',
//     621: 'linear-gradient(0deg, rgba(200, 200, 200, 1), rgba(250, 250, 250, 1))',
//     622: 'linear-gradient(0deg, rgba(200, 200, 200, 1), rgba(250, 250, 250, 1))',
//     700: 'linear-gradient(35deg, rgba(255, 175, 0, 1), rgba(150, 150, 150, 1))',
//     701: 'linear-gradient(35deg, rgba(255, 175, 0, 1), rgba(150, 150, 150, 1))',
//     711: 'linear-gradient(35deg, rgba(255, 175, 0, 1), rgba(150, 150, 150, 1))',
//     721: 'linear-gradient(35deg, rgba(255, 175, 0, 1), rgba(150, 150, 150, 1))',
//     731: 'linear-gradient(35deg, rgba(255, 175, 0, 1), rgba(150, 150, 150, 1))',
//     741: 'linear-gradient(35deg, rgba(255, 175, 0, 1), rgba(150, 150, 150, 1))',
//     751: 'linear-gradient(35deg, rgba(255, 175, 0, 1), rgba(150, 150, 150, 1))',
//     761: 'linear-gradient(35deg, rgba(255, 175, 0, 1), rgba(150, 150, 150, 1))',
//     762: 'linear-gradient(35deg, rgba(255, 175, 0, 1), rgba(150, 150, 150, 1))',
//     771: 'linear-gradient(35deg, rgba(255, 175, 0, 1), rgba(150, 150, 150, 1))',
//     781: 'linear-gradient(35deg, rgba(255, 175, 0, 1), rgba(150, 150, 150, 1))',
//     800: 'linear-gradient(25deg, rgba(0, 230, 255, 1), rgba(0, 100, 255, 1))',
//     801: 'linear-gradient(0deg, rgba(150, 150, 150, 1), rgba(225, 225, 225, 1))',
//     802: 'linear-gradient(0deg, rgba(150, 150, 150, 1), rgba(225, 225, 225, 1))',
//     803: 'linear-gradient(0deg, rgba(150, 150, 150, 1), rgba(225, 225, 225, 1))',
//     804: 'linear-gradient(0deg, rgba(150, 150, 150, 1), rgba(225, 225, 225, 1))',
//   };

//   fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
//     .then(response => response.json())
//     .then(data => {
//       // console.log(data);
//       const weatherTileContainer = document.getElementById('grid');

//       const weatherTile = document.createElement('div');
//       weatherTile.classList.add('tile', 'tall-tile', 'weather-tile');

//       const weatherTileContent = document.createElement('div');
//       weatherTileContent.classList.add('weather-content');

//       const weatherCity = document.createElement('h2');
//       weatherCity.classList.add('weather-city');
//       weatherCity.textContent = data.name;

//       const weatherIcon = document.createElement('img');
//       weatherIcon.classList.add('weather-icon');
//       weatherIcon.setAttribute('src', `http://openweathermap.org/img/w/${data.weather[0].icon}.png`);

//       const weatherConditions = document.createElement('h5');
//       weatherConditions.classList.add('weather-conditions');
//       weatherConditions.textContent = data.weather[0].main;

//       const weatherDegrees = document.createElement('div');
//       weatherDegrees.classList.add('weather-degrees');

//       const weatherCelsius = document.createElement('h5');
//       weatherCelsius.classList.add('weather-celsius');
//       weatherCelsius.textContent = `C: ${Math.round(data.main.temp)}°`;

//       const weatherFahrenheit = document.createElement('h5');
//       weatherFahrenheit.classList.add('weather-fahrenheit');
//       weatherFahrenheit.textContent = `F: ${Math.round(data.main.temp * 1.8 + 32)}°`;

//       weatherTileContent.appendChild(weatherCity);
//       weatherTileContent.appendChild(weatherIcon);
//       weatherTileContent.appendChild(weatherConditions);
//       weatherDegrees.appendChild(weatherCelsius);
//       weatherDegrees.appendChild(weatherFahrenheit);
//       weatherTileContent.appendChild(weatherDegrees);
//       weatherTile.appendChild(weatherTileContent);

//       const conditionId = data.weather[0].id;
//       const backgroundColor = colorMap[conditionId];
//       weatherTile.style.background = backgroundColor || 'red';

//       weatherTileContainer.appendChild(weatherTile);

//     })
//     .catch(error => console.log(error));
// }

// getWeather('Herzliya');
// getWeather('Seattle');