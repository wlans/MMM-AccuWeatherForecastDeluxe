Module.register("MMM-NOAA-Weather-Forecast", {
    defaults: {
        lat: 0.0,
        lon: 0.0,
        endpoint: "https://api.weather.gov/points/", // NOAA points API endpoint
        units: config.units || "imperial", // Use MagicMirror config for units
        updateInterval: 120, // minutes
        updateFadeSpeed: 500, // milliseconds
        requestDelay: 0,
        showDailyForecast: true,
        maxDailiesToShow: 5,
        showWindSpeed: true,
        showTemperature: true,
    },

    getScripts: function () {
        return ["moment.js", this.file("skycons.js")];
    },

    getStyles: function () {
        return ["MMM-NOAA-Weather-Forecast.css"];
    },

    start: function () {
        Log.info("Starting module: " + this.name);

        this.weatherData = null;
        this.iconIdCounter = 0;
        this.formattedWeatherData = null;
        this.animatedIconDrawTimer = null;

        if (!this.config.listenerOnly) {
            // Start data polling
            const self = this;
            setTimeout(function () {
                // First data pull is delayed by config
                self.getData();
                setInterval(function () {
                    self.getData();
                }, self.config.updateInterval * 60 * 1000); // Convert to milliseconds
            }, this.config.requestDelay);
        }

        if (this.config.useAnimatedIcons) {
            this.skycons = new Skycons({
                "monochrome": false,
                "colors": {
                    "main": "#FFFFFF",
                    "moon": this.config.colored ? "#FFFDC2" : "#FFFFFF",
                    "fog": "#FFFFFF",
                    "fogbank": "#FFFFFF",
                    "cloud": this.config.colored ? "#BEBEBE" : "#999999",
                    "snow": "#FFFFFF",
                    "leaf": this.config.colored ? "#98D24D" : "#FFFFFF",
                    "rain": this.config.colored ? "#7CD5FF" : "#FFFFFF",
                    "sun": this.config.colored ? "#FFD550" : "#FFFFFF"
                }
            });
        }
    },

    getTemplate: function () {
        return "MMM-NOAA-Weather-Forecast.njk";
    },

    getTemplateData: function () {
        return {
            loading: this.formattedWeatherData == null,
            config: this.config,
            forecast: this.formattedWeatherData,
            inlineIcons: {
                rain: this.generateIconSrc("i-rain"),
                snow: this.generateIconSrc("i-snow"),
                wind: this.generateIconSrc("i-wind")
            },
            animatedIconSizes: {
                main: this.config.mainIconSize,
                forecast: (this.config.hourlyForecastLayout == "tiled" || this.config.dailyForecastLayout == "tiled") ? this.config.forecastTiledIconSize : this.config.forecastTableIconSize
            },
            moduleTimestampIdPrefix: this.config.moduleTimestampIdPrefix,
            identifier: this.identifier,
            timeStamp: this.dataRefreshTimeStamp
        };
    },

    getData: function () {
        const pointUrl = `${this.config.endpoint}${this.config.lat},${this.config.lon}`;
        fetch(pointUrl)
            .then(response => response.json())
            .then(pointData => {
                const forecastUrl = pointData.properties.forecast;
                return fetch(forecastUrl);
            })
            .then(response => response.json())
            .then(forecastData => {
                this.processWeatherData(forecastData);
                this.updateDom(this.config.updateFadeSpeed);
            })
            .catch(error => {
                Log.error(`${this.name} failed to fetch weather data: ${error}`);
            });
    },

    processWeatherData: function (weatherData) {
        const forecastPeriods = weatherData.properties.periods;
        const dailyForecast = forecastPeriods.filter((period, index) => index < this.config.maxDailiesToShow);

        this.formattedWeatherData = dailyForecast.map(period => {
            return {
                name: period.name,
                temperature: `${period.temperature} °${period.temperatureUnit}`,
                windSpeed: period.windSpeed,
                windDirection: period.windDirection,
                detailedForecast: period.detailedForecast,
                icon: period.icon
            };
        });
    },

    notificationReceived: function (notification, payload, sender) {
        if (
            this.config.listenerOnly &&
            notification === "NOAA_WEATHER_DATA"
        ) {
            this.weatherData = payload;
            this.formattedWeatherData = this.processWeatherData(payload);
            this.updateDom(this.config.updateFadeSpeed);
        }
    },

    generateIconSrc: function (icon) {
        console.log("icons/" + this.iconsets[this.config.iconset].path + "/" +
            icon + "." + this.iconsets[this.config.iconset].format);
        return this.file("icons/" + this.iconsets[this.config.iconset].path + "/" +
            icon + "." + this.iconsets[this.config.iconset].format);
    },

    clearIcons: function () {
        this.skycons.pause();
        var self = this;
        var animatedIconCanvases = document.querySelectorAll(".skycon-" + this.identifier);
        animatedIconCanvases.forEach(function (icon) {
            self.skycons.remove(icon.id);
        });
        this.iconIdCounter = 0;
    },

    getAnimatedIconId: function () {
        var iconId = "skycon_" + this.identifier + "_" + this.iconIdCounter;
        this.iconIdCounter++;
        return iconId;
    },

    playIcons: function (inst) {
        var animatedIconCanvases = document.querySelectorAll(".skycon-" + inst.identifier);
        animatedIconCanvases.forEach(function (icon) {
            inst.skycons.add(icon.id, icon.getAttribute("data-animated-icon-name"));
        });
        inst.skycons.play();
    }
});
