/**
 * New node file
 */

var http = require('http');
var post_data = JSON.stringify({
	"test" : "post"
});

var options = {
		
	host: 'calm.plains-7711.herokuapp.com',
	port: 80,
	path: '/option/something',
	//query: qs,
	method: 'POST',
	headers: {
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
