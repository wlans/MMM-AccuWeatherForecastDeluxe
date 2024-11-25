/*********************************

  MagicMirror² Module:
  MMM-AccuWeatherMapForecast
  https://github.com/maxbethge/MMM-AccuWeatherMapForecastDeluxe

  Icons in use by this module:

  Skycons - Animated icon set by Dark Sky
  http://darkskyapp.github.io/skycons/
  (using the fork created by Maxime Warner
  that allows individual details of the icons
  to be coloured
  https://github.com/maxdow/skycons)

  Climacons by Adam Whitcroft
  http://adamwhitcroft.com/climacons/

  Free Weather Icons by Svilen Petrov
  https://www.behance.net/gallery/12410195/Free-Weather-Icons

  Weather Icons by Thom
  (Designed for DuckDuckGo)
  https://dribbble.com/shots/1832162-Weather-Icons

  Sets 4 and 5 were found on Graphberry, but I couldn't find
  the original artists.
  https://www.graphberry.com/item/weather-icons
  https://www.graphberry.com/item/weathera-weather-forecast-icons

  Weather animated Icons by basmilius
  https://github.com/basmilius/weather-icons

  Some of the icons were modified to better work with the module's
  structure and aesthetic.

  Weather data provided by AccuWeather API

  By Jeff Clarke
  Modified by Dirk Rettschlag
  Modified by Max Bethge
  Modified by Adam Garrett
  Modified by Wyatt Lansdale
  MIT Licensed

*********************************/

Module.register("MMM-AccuWeatherForecastDeluxe", {

    /*
      This module uses the Nunjucks templating system introduced in
      version 2.2.0 of MagicMirror.  If you're seeing nothing on your
      display where you expect this module to appear, make sure your
      MagicMirror version is at least 2.2.0.
    */
    requiresVersion: "2.2.0",

    defaults: {
        apikey: "",
        apikey2: "",
        locationKey: "",
        endpoint: "http://dataservice.accuweather.com/forecasts/v1/daily/5day",
        endpointNow: "http://dataservice.accuweather.com/currentconditions/v1",
        endpointHourly: "http://dataservice.accuweather.com/forecasts/v1/hourly/12hour",
        updateInterval: 120, // minutes
        updateFadeSpeed: 500, // milliseconds
        requestDelay: 0,
        listenerOnly: false,
        units: config.units,
        language: "en-us",
        colored: true,
        highColor: '#F8DD70',
        lowColor: '#6FC4F5',
        relativeColors: false,
        showCurrentConditions: true,
        showExtraCurrentConditions: true,
        showSummary: true,
        hourlyForecastHeaderText: "",
        showForecastTableColumnHeaderIcons: true,
        showHourlyForecast: true,
        hourlyForecastLayout: "tiled",
        hourlyForecastInterval: 3,
        maxHourliesToShow: 3,
        dailyForecastHeaderText: "",
        showDailyForecast: true,
        dailyForecastLayout: "tiled",
        maxDailiesToShow: 5,
        ignoreToday: false,
        showDailyLow: true,
        showDailyHiLowSeparator: true,
        showDayAsTodayInDailyForecast: false,
        showDayAsTomorrowInDailyForecast: false,
        showFeelsLike: true,
        showPrecipitationProbability: true,
        showPrecipitationSeparator: true,
        showPrecipitationAmount: true,
        showWindSpeed: true,
        showWindDirection: false, // setting to true breaks layout. will fix later.
        showWindGust: false, // setting to true breaks layout. will fix later
        iconset: "1c",
        mainIconset: defaults.iconset,
        useAnimatedIcons: false, // readme says this is legacy and to use iconsets 6fa and 6oa instead, so defaulting to false
        animateMainIconOnly: false, // like 'useAnimatedIcons, this should be deprecated. Instead set mainIconset to to 6oa or 6fa
        showInlineIcons: true,
        mainIconSize: 100,
        forecastTiledIconSize: 70,
        forecastTableIconSize: 30,
        showAttribution: true,
        label_temp_i: "°F",
        label_temp_m: "°C",
        label_maximum: "max ",
        label_high: "H ",
        label_low: "L ",
        label_hi_lo_separator: " / ",
        label_feels_like: "Feels like ",
        label_timeFormat: "h a",
        label_days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        label_today: "Today",
        label_tomorrow: "Tomorrow",
        label_ordinals: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"],
        label_rain_i: " in",
        label_rain_m: " mm",
        label_snow_i: " in",
        label_snow_m: " mm",
        label_wind_i: " mph",
        label_wind_m: " m/s",
        label_gust_i: " mph",
        label_gust_m: " m/s",
        label_no_precip: "0%",
        label_no_wind: "0 mph",
        label_precip_separator: " ",
        label_gust_wrapper_prefix: " (",
        label_gust_wrapper_suffix: ")",
        dp_precip_leading_zero: false,
        dp_wind_leading_zero: true,
        dp_rain_i: 2,
        dp_rain_m: 0,
        dp_snow_i: 2,
        dp_snow_m: 0,
        dp_temp_i: 0,
        dp_temp_m: 0,
        dp_wind_i: 0,
        dp_wind_m: 0,
        moduleTimestampIdPrefix: "ACCUWEATHER_ONE_CALL_TIMESTAMP_",
    },

    validUnits: ["imperial", "metric", ""],
    validHourlyLayouts: ["tiled", "table"],
    validDailyLayouts: ["tiled", "table", "bars"],

    getScripts: function () {
        return ["moment.js", this.file("skycons.js")];
    },

    getStyles: function () {
        return ["MMM-AccuWeatherForecastDeluxe.css"];
    },

    getTemplate: function () {
        return "MMM-AccuWeatherForecastDeluxe.njk";
    },

    getTemplateData: function () {
        return {
            phrases: {
                loading: this.translate("LOADING")
            },
            loading: this.formattedWeatherData == null ? true : false,
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

    start: function () {
        Log.info("Starting module: " + this.name);

        this.weatherData = null;
        this.iconIdCounter = 0;
        this.formattedWeatherData = null;
        this.animatedIconDrawTimer = null;

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

        if (this.validUnits.indexOf(this.config.units) == -1) {
            this.config.units = "imperial";
        }
        if (this.validHourlyLayouts.indexOf(this.config.hourlyForecastLayout) == -1) {
            this.config.hourlyForecastLayout = "tiled";
        }
        if (this.validDailyLayouts.indexOf(this.config.dailyForecastLayout) == -1) {
            this.config.dailyForecastLayout = "tiled";
        }
        if (this.iconsets[this.config.iconset] == null) {
            this.config.iconset = "1c";
        }
        if (this.iconsets[this.config.mainIconset] == null) {
            this.config.mainIconset = this.config.iconset;
        }
        this.sanitizeNumbers([
            "updateInterval",
            "requestDelay",
            "hourlyForecastInterval",
            "maxHourliesToShow",
            "maxDailiesToShow",
            "mainIconSize",
            "forecastIconSize",
            "updateFadeSpeed",
            "animatedIconPlayDelay"
        ]);

        if (this.config.colored == false) {
            this.config.iconset = this.config.iconset.replace("c", "m");
            this.config.mainIconset = this.config.mainIconset.replace("c", "m");
        }

        if (!this.config.socketListenerOnly) {
            var self = this;
            setTimeout(function () {
                self.getData();
                setInterval(function () {
                    self.getData();
                }, self.config.updateInterval * 60 * 1000);
            }, this.config.requestDelay);
        }

        this.config.unitsFormatted = this.config.units.charAt(0).toUpperCase() + this.config.units.slice(1);
        Log.info("[MMM-AccuWeatherForecastDeluxe] " + "  unitsFormatted: "
    }
});
