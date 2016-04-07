var express = require('express');
var settings = require('./settings.json');
var parser = require('body-parser');
var HueTemp = require('node-hue-api');
var HueApi = require('node-hue-api').HueApi;
var fs = require('fs');
var gpio = require('gpio');

var api = HueApi
var lightState = HueTemp.lightState;
var app = express();
app.set('hueIP', settings.hueIP);
app.set('deviceDescription', settings.deviceDescription);
app.set('username', settings.username);

var run = true;
var on = true;
var usenameAvailable = false;
if(app.get('username').length >5){
	usenameAvailable = true;
}

var displayResult = function(result){
	console.log(JSON.stringify(result, null, 2));
};

var saveUsernameResult = function(result){
	console.log("Yay: " + JSON.stringify(result));
	settings.username = JSON.stringify(result);
	
	fs.writeFile('./settings.json', JSON.stringify(settings, null, 2), function (err) {
		if (err) return console.log(err)
	});
	app.set('username', settings.username);
}

var displayError = function(err) {
    console.log(err);
};

var getNewUsername = function(){
	var hue = new HueApi();
	hue.registerUser(app.get('hueIP'), app.get('deviceDescription'))
	.then(saveUsernameResult)
	.fail(displayError)
	.done();
}

var makeConnectionWithBride = function(result){
	var username = app.get('username');
	console.log(username);
	if(username === "null" | username.lenght < 5 | username == ""){
		getNewUsername();
	}
	
	api = new HueApi(app.get('hueIP'), app.get('username'));
	api.getLights();
}

var lightInfo = function(){
	api.lights(function(err, lights) {
		if (err) console.log(err);
		displayResult(lights);
	});
}

var gpiopin = gpio.export(17, {
   direction: "in",
   ready: function() {
   }
});

if(run){
	makeConnectionWithBride();
	run = false;
}
lightInfo();

if(usenameAvailable){
gpiopin.on("change", function(val) {
   // value will report either 1 or 0 (number) when the value changes
   console.log(val)
   if(val === 1){
	   if(on){
		   turnOn(4);
	   } else {
		   turnOff(4);
	   }
	  on = !on;
   }	   
});

function turnOn(light)
{

	var state = lightState.create().on().colorLoop();

	// --------------------------
	// Using a promise
	api.setLightState(light, state)
		.done();
}

function turnOff(light)
{
	var state = lightState.create().off();

	// --------------------------
	// Using a promise
	api.setLightState(light, state)
		.done();
}

// Middelware, voor alle /api/* request
app.all('*', function(req, res, next)
{
        // Log alle request
        console.log( req.method + " " + req.url) ;
        next();
});

var port = process.env.PORT || 8080;
var server = app.listen( port , function() {
        console.log('Listening server on port ' + server.address().port );
});
} else{
	console.log('Got username. Please restart the application');
}

//hue.imegumii.space 367cac47bb5b4bf26fb8e3787818af
