/**
 * New node file
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , param = require('./routes/quer_parameter');
var app = express();

var post_data = JSON.stringify({
	grant_type=password&username=&password=<password>
});

var options = {
		
	host: 'sso.dexit.co',
	port: 80,
	path: '/openam/oauth2/access_token?realm=activesight',
	//query: qs,
	method: 'POST',
	headers: {
		'Authorization': 'Basic ZHgtc2VydmljZToxMjMtNDU2LTc4OQ==', 
		'Content-Type': 'application/json',
		'Content-Length': post_data.length
	}
	
};

var post_req = http.request(options, function(res){
	console.log('STATUS: '+ res.statusCode);
	console.log('HEADERS: '+JSON.stringify(res.headers));
	//console.log('BODY: '+res.responseText);
	var str = '';
	//Set the encoding of the response to UTF8
	res.setEncoding('utf8');
	//chunks of data being received 
	res.on('data', function(chunk){
		//append this chunk of data to str
		str += chunk;
	});
	
	//response received - end event
	res.on('end', function(){
		console.log("message-"+str);
	});
	
	//Error case
	res.on('error', function (e){
		//return the error to the callback function
		//return throw(e)
	});
});

post_req.write(post_data);
post_req.end();
