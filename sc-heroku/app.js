var express = require('express');
var bodyParser = require('body-parser');
var indexController = require('./controllers/index.js');
var fs = require('fs');
var mongoose = require('mongoose')

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

mongoose.connect('mongodb://soundshroud:soundshroud@ds061767.mongolab.com:61767/heroku_app35003841');
var Track = mongoose.model('Track', {
	url: String
});


app.get('/', function(req, res){
	Track.find(function(error, data) {
		if (error)
			console.log('Maybe there are no tracks hidden yet?');
		else
			res.render('index', {permahiddenTracks: tracks});
	});
});

var server = app.listen(7349, function() {
	console.log('Express server listening on port ' + server.address().port);
});
