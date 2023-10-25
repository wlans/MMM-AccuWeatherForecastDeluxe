/*********************************

  Node Helper for MMM-AccuWeatherForecastDeluxe.

  This helper is responsible for the DarkSky-compatible data pull from AccuWeather.
  At a minimum the API key, Latitude and Longitude parameters
  must be provided.  If any of these are missing, the request
  to AccuWeather will not be executed, and instead an error
  will be output the the MagicMirror log.

  Additional, this module supplies two optional parameters:

    units - one of "metric", "imperial"
    lang - Any of the languages AccuWeather supports, as listed here: https://openweathermap.org/api/one-call-api#multi

  The DarkSky-compatible API request looks like this:

    https://api.openweathermap.org/data/2.5/onecall?lat=LATITUDE&lon=LONGITUDE&units=XXX&lang=YY&appid=API_KEY

*********************************/

var NodeHelper = require("node_helper");
var needle = require("needle");
var moment = require("moment");

module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for module [" + this.name + "]");
    },

    socketNotificationReceived: function(notification, payload) {
        console.log("[MMM-AccuWeatherForecastDeluxe] " + notification );
        if (notification === "ACCUWEATHER_ONE_CALL_FORECAST_GET") {

            var self = this;

            if (payload.apikey == null || payload.apikey == "") {
                console.log("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** No API key configured. Get an API key at http://accuweather.com");
            } else if (payload.locationKey == null || payload.locationKey == "" ) {
                console.log("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** LocationKey not provided.");
            //} else if (payload.latitude == null || payload.latitude == "" || payload.longitude == null || payload.longitude == "") {
            //    console.log("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** Latitude and/or longitude not provided.");
            } else {

                //make request to OpenWeather onecall API
                //var url = payload.endpoint +
                //    "?appid=" + payload.apikey +
                //    "&lat=" + payload.latitude +
                //    "&lon=" + payload.longitude +
                //    (payload.units !== "" ? "&units=" + payload.units : "") +
                 //   "&lang=" + payload.language;
                // "&exclude=minutely"

                var url = payload.endpoint +
                    "/" + payload.locationKey +
                    "?apikey=" + payload.apikey +
                    "&lang=" + payload.language + 
                    "&details=true";


                var url2 = payload.endpointNow +
                    "/" + payload.locationKey +
                    "?apikey=" + payload.apikey  +
                    "&lang=" + payload.language + 
                    "&details=true";


                //var resp = {};

                (async () => {
                    var f = {};
                    console.log("[MMM-AccuWeatherForecastDeluxe] Getting data: " + url);
                    const resp1 = await fetch(url);
                    const json1 = await res.json();
                    console.log(json1);
                    console.error("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + "  " + json1);
                    f = json1;
                    f.instanceId = payload.instanceId;
                    console.error("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + "  after 1");
                    console.log("[MMM-AccuWeatherForecastDeluxe] Getting data: " + url2);
                    const resp2 = await fetch(url2);
                    const json2 = await resp2.json();
                    f.Current = json2;
                    console.log(json2);
                    console.error("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + "  after 2");
                    console.error("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + "  " + f);
                    self.sendSocketNotification("ACCUWEATHER_ONE_CALL_FORECAST_DATA", f);
                    console.error("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + "  after sendSocketNotification");
                  })();

                /*
               
                try {
                    const resp1 =  await needle('get', url, {json: true})
                    .then(function (response) {
                        //const parsed = JSON.parse(response.body);
                        return response;
                       })
                    .catch(function(err) {
                        console.error("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** " + err);
                      });
                      
                    //console.log("[MMM-AccuWeatherForecastDeluxe] waiting for body");
                    resp =  resp1.body;
                    console.log("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " " + resp);
                    resp.instanceId = payload.instanceId;
                    
                  } catch (err) {
                    console.error("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** " + err);
                  }

                  url = payload.endpointNow +
                    "/" + payload.locationKey +
                    "?apikey=" + payload.apikey  +
                    "&lang=" + payload.language + 
                    "&details=true";

                console.log("[MMM-AccuWeatherForecastDeluxe] Getting current weather data: " + url);
                
                  try {
                    const resp2 =  await needle('get', url, {json: true})
                    .then(function (response) {
                        //const parsed = JSON.parse(response.body);
                        return response;
                       })
                    .catch(function(err) {
                        console.error("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** " + err);
                      });
                    //console.log("[MMM-AccuWeatherForecastDeluxe] waiting for body");
                    //resp =  response.body;
                    console.log("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " " + resp2);
                    resp.CurrentWeather =  resp2.body;
                    console.log("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " " + resp);
                  } catch (err) {
                    console.error("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** " + err);
                  }
               // .then(function(response) {
               //     return doSomethingWith(response)
               // })
               // .catch(function(err) {
               //     console.log("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** " + err);
               // })
*/
                /*
                needle.get(url, function(error, response, body) {
                    console.log("[MMM-AccuWeatherForecastDeluxe] " + JSON.stringify(body));
                    if (!error && response.statusCode == 200) {

                        //Good response
                        //console.log("[MMM-AccuWeatherForecastDeluxe] before resp");
                        //var resp = body; //JSON.stringify(body); //body; //needle automagically parses the response as JSON
                        resp = body;
                        //console.log("[MMM-AccuWeatherForecastDeluxe] before instance id - " + payload.instanceId);
                        resp.instanceId = payload.instanceId;
                        //console.log("[MMM-AccuWeatherForecastDeluxe] after instance id - " + resp.instanceId);
                        console.log("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " " + resp);
                        self.sendSocketNotification("ACCUWEATHER_ONE_CALL_FORECAST_DATA", resp);
                        //console.log("[MMM-AccuWeatherForecastDeluxe] after sendSocketNotification");

                    } else {
                        console.log("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** " + error + " - " + body);
                    }

                });
                
*/
                //var apikey2 = (payload.apikey2 == null || payload.apikey2 == "") ? payload.apikey : payload.apikey2
                /*
                url = payload.endpointNow +
                    "/" + payload.locationKey +
                    "?apikey=" + payload.apikey  +
                    "&lang=" + payload.language + 
                    "&details=true";

                console.log("[MMM-AccuWeatherForecastDeluxe] Getting current weather data: " + url);

                needle.get(url, function(error, response, body) {
                    console.log("[MMM-AccuWeatherForecastDeluxe] " + JSON.stringify(body));
                    if (!error && response.statusCode == 200) {

                        //Good response
                        //console.log("[MMM-AccuWeatherForecastDeluxe] before resp");
                        //var resp = body; //JSON.stringify(body); //body; //needle automagically parses the response as JSON
                        resp.CurrentWeather = body;
                        //console.log("[MMM-AccuWeatherForecastDeluxe] before instance id - " + payload.instanceId);
                        //resp.instanceId = payload.instanceId;
                        //console.log("[MMM-AccuWeatherForecastDeluxe] after instance id - " + resp.instanceId);
                        console.log("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " " + resp);
                        //self.sendSocketNotification("ACCUWEATHER_ONE_CALL_FORECAST_DATA", resp);
                        //console.log("[MMM-AccuWeatherForecastDeluxe] after sendSocketNotification");

                    } else {
                        console.log("[MMM-AccuWeatherForecastDeluxe] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** " + error + " - " + body);
                    }

                });
*/
                console.log("[MMM-AccuWeatherForecastDeluxe] after API calls");

                //if(resp != null) {
               //   self.sendSocketNotification("ACCUWEATHER_ONE_CALL_FORECAST_DATA", resp);
               //   console.log("[MMM-AccuWeatherForecastDeluxe] after sendSocketNotification");
               // }

            }
        }
    },


});