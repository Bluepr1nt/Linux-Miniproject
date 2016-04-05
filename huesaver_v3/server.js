var express = require('express');
var settings = require('./settings.json');
var parser = require('body-parser');
var HueApi = require('node-hue-api').HueApi;
var fs = require('fs');
var gpio = require('gpio');

var api = HueApi;
var app = express();
app.set('hueIP', settings.hueIP);
app.set('deviceDescription', settings.deviceDescription);
app.set('username', settings.username);

var run = true;

var displayResult = function(result){
	console.log(JSON.stringify(result, null, 2));
};

var displayUserResult = function(result){
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
	console.log('user');
	var hue = new HueApi();
	hue.registerUser(app.get('hueIP'), app.get('deviceDescription'))
	.then(console.log('name'))
	.then(displayUserResult)
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
	api.getConfig();
}
if(run){
	makeConnectionWithBride();
	run = false;
}

//hue.imegumii.space 367cac47bb5b4bf26fb8e3787818af
