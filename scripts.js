document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'd5aee4dddc2f3d0a44388c385978d4de';
    const latitude = 48.8666667; 
    const longitude = 2.33333; 

    function fetchUVData() {
        const currentUVUrl = `http://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
        
        fetch(currentUVUrl)
            .then(response => response.json())
            .then(data => {
                document.getElementById('uv-value').textContent = data.value;
                displayTips(data.value);
            })
            .catch(error => {
                console.error('Error fetching current UV data:', error);
                document.getElementById('uv-value').textContent = 'Error';
            });
    }

    function displayTips(uvIndex) {
        const tipsList = document.getElementById('tips-list');
        tipsList.innerHTML = ''; 

        const tips = [
            "Wear sunglasses that block 100% of UV rays.",
            "Use sunscreen with at least SPF 30.",
            "Seek shade during midday hours.",
            "Wear protective clothing and a wide-brimmed hat.",
            "Be aware of surfaces that reflect UV rays, like sand and water."
        ];

        if (uvIndex >= 3 && uvIndex <= 5) {
            tips.push("Moderate UV Index: Consider wearing sunscreen and protective clothing.");
        } else if (uvIndex >= 6 && uvIndex <= 7) {
            tips.push("High UV Index: Wear sunscreen, protective clothing, and stay in the shade if possible.");
        } else if (uvIndex >= 8 && uvIndex <= 10) {
            tips.push("Very High UV Index: Take extra precautions as unprotected skin and eyes can burn quickly.");
        } else if (uvIndex >= 11) {
            tips.push("Extreme UV Index: Avoid being outside during midday hours. Wear protective clothing and use a high SPF sunscreen.");
        }

        tips.forEach(tip => {
            const listItem = document.createElement('li');
            listItem.textContent = tip;
            tipsList.appendChild(listItem);
        });
    }

    fetchUVData();
});