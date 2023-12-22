// Ensures that the same city is loaded when the user changes the type of data to be displayed.
let current_city = "london";

// Handles the initial setup
async function start() {
    document.addEventListener("DOMContentLoaded", function () {
        $(`#loadingSpinner`).show();
    });

    if (document.readyState === `ready` || document.readyState === `complete`) {
        await init();
    } else {
        document.onreadystatechange = function () {
            if (document.readyState === "complete") {
                init();
            }
        };
    }
}

// Ensures everything is initialiazed well and in the right order.
async function init() {
    searchFormSetup();
    $(`#serverResponse`).hide();
    $(`#loadingSpinner`).hide();
    await getData("london");
}

// Sets up the search form functionality.
function searchFormSetup() {
    const searchForm = document.getElementById(`searchForm`);
    searchForm.addEventListener("submit", function (e) {
        e.preventDefault();

        if ($(`#city`).val().trim() == "") {
            alert("Please enter a valid city");
        } else {
            getData($(`#city`).val().trim());
        }
    });
}

// Handles fetching data from the api
async function getData(city) {
    try {
        $(`#serverResponse`).show();
        $(`#serverResponse`).removeClass("error");
        $(`#serverResponse p`).text(`Loading...`);

        const api_key = `99ae071e9b8847e39f8134538232212`;
        let base_url = `https://api.weatherapi.com/v1/forecast.json`;
        let end_url = `&days=9&aqi=no&alerts=no`;
        let url = `${base_url}?key=${api_key}&q=${city}${end_url}`;

        const response = await fetch(url);

        if (!response.ok) {
            const err_msg = `Unable to fetch the data. Please make sure you have entered a valid city.`;
            $(`#serverResponse`).show();
            $(`#serverResponse`).addClass("error");
            $(`#serverResponse p`).text(err_msg);
            return;
        }

        const response_data = await response.text();
        const parsed_data = JSON.parse(response_data);
        if (parsed_data.code && parsed_data.code === 1006) {
            $(`#serverResponse`).addClass("error");
            $(`#serverResponse p`).text(parsed_data.message);
            return;
        }
        $(`#serverResponse`).removeClass("error");
        $(`#serverResponse`).hide();
        current_city = city;

        mainView(response_data);
        forecastView(response_data);
    } catch (error) {
        $(`#serverResponse`).show();
        $(`#serverResponse`).addClass("error");
        $(`#serverResponse p`).text(`Fetch Error: ${error}`);
    }
}

// Fills the html code of the current day's weather forecast with the retrieved data
function mainView(info) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const data = JSON.parse(info);
    let todayTemp = data.forecast.forecastday[0].day.avgtemp_c;
    if (document.querySelector(`input[name="tempRadio"]:checked`).value === `fahrenheit`) {
        todayTemp = data.forecast.forecastday[0].day.avgtemp_f;
    }
    $(`#todayTemp`).text(todayTemp);

    let todayPic = "assets/" + data.forecast.forecastday[0].day.condition.icon.split(`/`).pop().replace(`.png`, `.svg`);
    $(`#todayPic`).attr(`src`, todayPic);

    let todayDate = daysOfWeek[new Date(data.forecast.forecastday[0].date).getDay()];
    $(`#todayDate`).text(todayDate);

    let regionName = data.location.name;
    $(`#regionName`).text(regionName);

    let todayText = data.forecast.forecastday[0].day.condition.text;
    $(`#todayText`).text(todayText);

    let todayHumidity = data.forecast.forecastday[0].day.avghumidity;
    $(`#todayHumidity`).text(todayHumidity + `%`);

    let todayPressure = data.current.pressure_mb;
    $(`#todayPressure`).text(todayPressure + ` mB`);

    let todayWindSpeed = data.forecast.forecastday[0].day.maxwind_kph + " km/h";
    if (document.querySelector(`input[name="windSpeed"]:checked`).value === `mph`) {
        todayWindSpeed = data.forecast.forecastday[0].day.maxwind_mph + " m/h";
    }
    $(`#todayWindSpeed`).text(todayWindSpeed);
}

// Fills the html code of the other days' weather forecast with the retrieved data
function forecastView(info) {
    const data = JSON.parse(info);
    let i = 1;
    while (i < 9) {
        singleForecastView(data, i);
        i += 1;
    }
}

// Handles each individual's view's weather data.
function singleForecastView(data, index) {
    const daysOfWeekShort = [`Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`];

    const dayIndex = new Date(data.forecast.forecastday[index].date).getDay();
    let todayDate = daysOfWeekShort[dayIndex];
    $(`#day${index + 1}`).text(todayDate);
    const icon = data.forecast.forecastday[index].day.condition.icon;
    let todayPic = "assets/" + icon.split("/").pop().replace(".png", ".svg");
    $(`#day${index + 1}Pic`).attr(`src`, todayPic);
    let todayTemp = data.forecast.forecastday[index].day.avgtemp_c;
    const input = document.querySelector(`input[name="tempRadio"]:checked`);
    if (input.value === `fahrenheit`) {
        todayTemp = data.forecast.forecastday[index].day.avgtemp_f;
    }
    $(`#day${index + 1}Temp`).text(todayTemp);
}

// Starts the script.
start();
