document.addEventListener('DOMContentLoaded', function() {
    function fetchUVData() {
        return {
            currentUV: 5,
            forecast: [
                { day: 'Monday', uv: 4 },
                { day: 'Tuesday', uv: 6 },
                { day: 'Wednesday', uv: 7 },
                { day: 'Thursday', uv: 3 },
                { day: 'Friday', uv: 5 }
            ]
        };
    }

    const uvData = fetchUVData();
    document.getElementById('uv-value').textContent = uvData.currentUV;

    const forecastList = document.getElementById('forecast-list');
    uvData.forecast.forEach(dayData => {
        const listItem = document.createElement('li');
        listItem.textContent = `${dayData.day}: UV Index ${dayData.uv}`;
        forecastList.appendChild(listItem);
    });
});
