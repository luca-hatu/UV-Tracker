document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'd5aee4dddc2f3d0a44388c385978d4de';
    const geocodingApiKey = apiKey;
    const locationIcon = document.getElementById('location-icon');
    const modal = document.getElementById('location-modal');
    const preferencesModal = document.getElementById('preferences-modal');
    const closeModal = document.querySelector('.close');
    const preferencesBtn = document.getElementById('preferences-btn');
    const currentLocationElement = document.getElementById('current-location');

    function fetchUVData(latitude, longitude) {
        const currentUVUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
        
        fetch(currentUVUrl)
            .then(response => response.json())
            .then(data => {
                const uvValue = data.value;
                document.querySelector('.uv-value').textContent = uvValue.toFixed(2);
                updateUVInfo(uvValue);
                updateCircleIndicator(uvValue);
            })
            .catch(error => {
                console.error('Error fetching current UV data:', error);
                document.querySelector('.uv-value').textContent = 'Error';
            });

        fetchUVForecast(latitude, longitude);
    }

    function fetchUVForecast(latitude, longitude) {
        const forecastUVUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

        fetch(forecastUVUrl)
            .then(response => response.json())
            .then(data => {
                console.log('Forecast data:', data);
                if (data.daily) {
                    const daily = data.daily;
                    let forecastHtml = '<ul>';
                    let detailedForecastHtml = '<ul>';
                    daily.forEach((day, index) => {
                        if (index === 0) return; 
                        const uvIndex = day.uvi;
                        const date = new Date(day.dt * 1000).toLocaleDateString();
                        forecastHtml += `<li>${date}: UV Index ${uvIndex.toFixed(2)}</li>`;
                        detailedForecastHtml += `
                            <li>
                                <strong>${date}</strong>: 
                                UV Index ${uvIndex.toFixed(2)}
                                <div>Max Temp: ${day.temp.max}°C</div>
                                <div>Min Temp: ${day.temp.min}°C</div>
                            </li>`;
                    });
                    forecastHtml += '</ul>';
                    detailedForecastHtml += '</ul>';
                    document.getElementById('forecast-uv').innerHTML = forecastHtml;
                    document.getElementById('forecast-details').innerHTML = detailedForecastHtml;
                } else {
                    document.getElementById('forecast-uv').textContent = 'No forecast data available';
                    document.getElementById('forecast-details').textContent = 'No detailed forecast data available';
                }
            })
            .catch(error => {
                console.error('Error fetching UV forecast data:', error);
                document.getElementById('forecast-uv').textContent = 'Error fetching forecast data';
                document.getElementById('forecast-details').textContent = 'Error fetching detailed forecast data';
            });
    }

    function updateUVInfo(uvIndex) {
        const uvDescription = document.querySelector('.uv-description');
        const timeToSunburn = document.querySelector('.time-to-sunburn');
        const recommendedSpf = document.querySelector('.recommended-spf');

        const { spf } = getUserPreferences();

        let uvLevelText = '';
        let timeToBurn = '';
        
        if (uvIndex <= 2) {
            uvLevelText = 'LOW';
            timeToBurn = '60 min';
        } else if (uvIndex <= 5) {
            uvLevelText = 'MODERATE';
            timeToBurn = '45 min';
        } else if (uvIndex <= 7) {
            uvLevelText = 'HIGH';
            timeToBurn = '25 min';
        } else if (uvIndex <= 10) {
            uvLevelText = 'VERY HIGH';
            timeToBurn = '10 min';
        } else {
            uvLevelText = 'EXTREME';
            timeToBurn = '5 min';
        }

        uvDescription.textContent = `${uvLevelText} UV Index`;
        timeToSunburn.textContent = `Time to sunburn: ${timeToBurn}`;
        recommendedSpf.textContent = `Recommended SPF: ${spf} SPF`;

        document.querySelector('.uv-level').textContent = `${uvLevelText} UV Index`;
    }

    function updateCircleIndicator(uvIndex) {
        const rotation = (Math.min(uvIndex, 11) / 11) * 360; 
        document.querySelector('.circle-indicator').style.transform = `rotate(${rotation}deg)`;
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                fetchUVData(latitude, longitude);
                currentLocationElement.textContent = `Current Location: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
            }, error => {
                console.error('Error getting location:', error);
                currentLocationElement.textContent = 'Location Error';
            });
        } else {
            console.error('Geolocation not supported by this browser.');
            currentLocationElement.textContent = 'Geolocation Not Supported';
        }
    }

    function fetchLocationData(locationName) {
        const geocodeUrl = `https://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=${geocodingApiKey}`;
        
        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                if (data.coord) {
                    const latitude = data.coord.lat;
                    const longitude = data.coord.lon;
                    fetchUVData(latitude, longitude);
                } else {
                    console.error('No coordinates found for this location.');
                }
            })
            .catch(error => {
                console.error('Error fetching location data:', error);
                currentLocationElement.textContent = 'Error fetching location data';
            });
    }

    function saveLocation(locationName) {
        localStorage.setItem('savedLocation', locationName);
    }

    function loadSavedLocation() {
        const savedLocation = localStorage.getItem('savedLocation');
        if (savedLocation) {
            fetchLocationData(savedLocation);
        }
    }

    function getUserPreferences() {
        const spf = localStorage.getItem('preferred-spf') || '30';
        const darkMode = localStorage.getItem('dark-mode') === 'true';
        return { spf, darkMode };
    }

    function setUserPreferences(preferences) {
        localStorage.setItem('preferred-spf', preferences.spf);
        localStorage.setItem('dark-mode', preferences.darkMode);
    }

    function applyTheme() {
        const { darkMode } = getUserPreferences();
        if (darkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('theme-toggle').checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            document.getElementById('theme-toggle').checked = false;
        }
    }

    preferencesBtn.addEventListener('click', function() {
        const { spf, darkMode } = getUserPreferences();
        document.getElementById('preferred-spf').value = spf;
        document.getElementById('theme-toggle').checked = darkMode;
        preferencesModal.style.display = 'block';
    });

    closeModal.addEventListener('click', function() {
        preferencesModal.style.display = 'none';
    });

    document.getElementById('preferences-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const spf = document.getElementById('preferred-spf').value;
        const darkMode = document.getElementById('theme-toggle').checked;
        setUserPreferences({ spf, darkMode });
        applyTheme();
        preferencesModal.style.display = 'none';
    });

    applyTheme();
    loadSavedLocation();
});
