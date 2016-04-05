var express = require('express');
var fs = require('fs');
var settings = require('../settings.json');
var parser = require('body-parser');
var discoverBridge = require('node-hue-api');
var HueApi = require('node-hue-api').HueApi;

var app = express();

app.set('hueIP', settings.hueIP);
app.set('deviceDescription', settings.deviceDescription);

var displayUserResult = function(result){
	console.log("Yay: " + JSON.stringify(result));
	settings.username = JSON.stringify(result);
	
	fs.writeFile('./settings.json', JSON.stringify(settings, null, 2), function (err) {
		if (err) return console.log(err)
	});
}

var displayError = function(err){
	console.log(err);
}

var hue = new HueApi();

var getNewUsername = function(result){
	hue.registerUser(app.get('hueIP'), app.get('deviceDescription'))
	.then(displayUserResult)
	.fail(displayError)
	.done();
}


/*
		
	hue.createUser(app.get('hueIP'), function(err, user){
	if(err) throw err;
	displayUserResult(user);
	});
	
*/
