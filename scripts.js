document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'd5aee4dddc2f3d0a44388c385978d4de';
    const locationIcon = document.getElementById('location-icon');
    const modal = document.getElementById('location-modal');
    const closeModal = document.querySelector('.close');
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
    }

    function updateUVInfo(uvIndex) {
        const uvDescription = document.querySelector('.uv-description');
        const timeToSunburn = document.querySelector('.time-to-sunburn');
        const recommendedSpf = document.querySelector('.recommended-spf');

        let uvLevelText = '';
        let timeToBurn = '';
        let spf = '';

        if (uvIndex <= 2) {
            uvLevelText = 'LOW';
            timeToBurn = '60 min';
            spf = '10 SPF';
        } else if (uvIndex <= 5) {
            uvLevelText = 'MODERATE';
            timeToBurn = '45 min';
            spf = '15 SPF';
        } else if (uvIndex <= 7) {
            uvLevelText = 'HIGH';
            timeToBurn = '25 min';
            spf = '30 SPF';
        } else if (uvIndex <= 10) {
            uvLevelText = 'VERY HIGH';
            timeToBurn = '10 min';
            spf = '50 SPF';
        } else {
            uvLevelText = 'EXTREME';
            timeToBurn = '5 min';
            spf = '50+ SPF';
        }

        uvDescription.textContent = `${uvLevelText} UV Index`;
        timeToSunburn.textContent = `Time to sunburn: ${timeToBurn}`;
        recommendedSpf.textContent = `Recommended SPF: ${spf}`;

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
                document.querySelector('.uv-value').textContent = 'Location Error';
            });
        } else {
            console.error('Geolocation not supported by this browser.');
            document.querySelector('.uv-value').textContent = 'Geolocation Not Supported';
        }
    }

    function loadStoredLocation() {
        const storedLatitude = localStorage.getItem('latitude');
        const storedLongitude = localStorage.getItem('longitude');
        if (storedLatitude && storedLongitude) {
            fetchUVData(storedLatitude, storedLongitude);
        } else {
            getLocation();
        }
    }

    locationIcon.addEventListener('click', function() {
        modal.style.display = 'block';
    });

    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.getElementById('fetch-manual-location').addEventListener('click', function() {
        const latitude = parseFloat(document.getElementById('latitude').value);
        const longitude = parseFloat(document.getElementById('longitude').value);
        if (!isNaN(latitude) && !isNaN(longitude)) {
            localStorage.setItem('latitude', latitude);
            localStorage.setItem('longitude', longitude);
            fetchUVData(latitude, longitude);
            modal.style.display = 'none';
        } else {
            alert('Please enter valid latitude and longitude.');
        }
    });

    loadStoredLocation();
});
