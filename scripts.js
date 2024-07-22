document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'd5aee4dddc2f3d0a44388c385978d4de';
    const locationIcon = document.getElementById('location-icon');
    const locationModal = document.getElementById('location-modal');
    const preferencesModal = document.getElementById('preferences-modal');
    const closeModals = document.querySelectorAll('.close');
    const preferencesBtn = document.getElementById('preferences-btn');
    const currentLocationElement = document.getElementById('current-location');
    const darkModeToggle = document.getElementById('theme-toggle');
    const body = document.body;

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

    function fetchCoordinates(locationName) {
        const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${locationName}&limit=1&appid=${apiKey}`;

        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const { lat, lon } = data[0];
                    localStorage.setItem('latitude', lat);
                    localStorage.setItem('longitude', lon);
                    fetchUVData(lat, lon);
                    locationModal.style.display = 'none';
                } else {
                    alert('Location not found. Please enter a valid location name.');
                }
            })
            .catch(error => {
                console.error('Error fetching coordinates:', error);
                alert('Error fetching coordinates. Please try again.');
            });
    }

    function loadStoredLocation() {
        const latitude = localStorage.getItem('latitude');
        const longitude = localStorage.getItem('longitude');
        if (latitude && longitude) {
            fetchUVData(latitude, longitude);
            currentLocationElement.textContent = `Stored Location: ${latitude}, ${longitude}`;
        } else {
            getLocation(); 
        }
    }

    function toggleDarkMode(isDarkMode) {
        if (isDarkMode) {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
    }

    function getUserPreferences() {
        const storedSpf = localStorage.getItem('preferred-spf') || '30';
        const isDarkMode = localStorage.getItem('dark-mode') === 'true';
        darkModeToggle.checked = isDarkMode;
        return { spf: storedSpf };
    }

    darkModeToggle.addEventListener('change', function() {
        const isDarkMode = darkModeToggle.checked;
        localStorage.setItem('dark-mode', isDarkMode);
        toggleDarkMode(isDarkMode);
    });

    preferencesBtn.addEventListener('click', function() {
        preferencesModal.style.display = 'block';
    });

    locationIcon.addEventListener('click', function() {
        locationModal.style.display = 'block';
    });

    closeModals.forEach(span => {
        span.addEventListener('click', function() {
            locationModal.style.display = 'none';
            preferencesModal.style.display = 'none';
        });
    });

    document.getElementById('fetch-location-name').addEventListener('click', function() {
        const locationName = document.getElementById('location-name').value;
        if (locationName) {
            fetchCoordinates(locationName);
        } else {
            alert('Please enter a location name.');
        }
    });

    document.getElementById('use-current-position').addEventListener('click', function() {
        getLocation();
        locationModal.style.display = 'none';
    });

    document.getElementById('fetch-manual-location').addEventListener('click', function() {
        const latitude = parseFloat(document.getElementById('latitude').value);
        const longitude = parseFloat(document.getElementById('longitude').value);
        if (!isNaN(latitude) && !isNaN(longitude)) {
            localStorage.setItem('latitude', latitude);
            localStorage.setItem('longitude', longitude);
            fetchUVData(latitude, longitude);
            locationModal.style.display = 'none';
        } else {
            alert('Please enter valid latitude and longitude.');
        }
    });

    document.getElementById('preferences-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const preferredSpf = document.getElementById('preferred-spf').value;
        const isDarkMode = darkModeToggle.checked;
        localStorage.setItem('preferred-spf', preferredSpf);
        localStorage.setItem('dark-mode', isDarkMode);
        toggleDarkMode(isDarkMode);
        preferencesModal.style.display = 'none';
    });

    loadStoredLocation(); 
});
