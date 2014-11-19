
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , param = require('./routes/quer_parameter')
  , accesstoken= require('./routes/accessToken')
  , node_schedule = require ('node-schedule'); 
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users/:id',param.parameterfunction);
app.get('/users', user.list);
//app.get('/winner/finalist', param.


//access token here 
var access = new accesstoken(); 
var accessTokenString =""; 

//calls authenticate function from routes/accessToken.js 
access.authenticate("cfung58@uwo.ca", "Beaufighter_1", "activesight", function(err, token){
	 accessTokenString = token; 
	 console.log("Token: " , token);
}); 

//function for contentplaylist (post) 
function content_playlist(res,req){
	var content_playlist_options = {
			host: 'developer.kb.dexit.co',
			port: 80,
			path: '/events/bb0f3a80-bcb2-4387-b339-3439554ce0f1/trigger',
			method: 'POST',
			headers: { 
				'X-Auth-Key' : accessTokenString
			}
		};
		
		//send the request with the options 
		req = http.request(content_playlist_options,function(res){
			//requires to be encoded in utf8 
			res.setEncoding('utf8');
			
			res.on('data',function(res2){
				console.log("Content playlist triggered");
			});
		});

		req.end();
}

//testing the contentplaylist function 
//content_playlist(); 

//query list: 
var start_query = "UPDATE contest_sc_intelligence SET current_msg=(SELECT starting_msg FROM contest_configuration), game_state = 'started'";
var end_query = "UPDATE contest_sc_intelligence SET current_msg=(SELECT final_msg FROM contest_configuration), game_state = 'final'";
var choose_winner_query= "UPDATE contest_sc_intelligence SET game_state = 'winner'";
var contest_duration_query = "SELECT contest_duration FROM contest_configuration";
var winner_selection_duration_query = "SELECT winner_selection_duration FROM contest_configuration";

//start the content 
app.post('/content', function(res, req){
		var datastore = res.body.datastore; //get datastore 
		var contest_duration; //contest duration time that will be retrieved from database
		var winner_selection_duration; //winner_selection_duration that will be retrieved from database 
		
		
		//create new time that will be the time needed to schedule the start 
		var start_time = new Date();
		//set hour and minutes here 
		var hours = 15;
		var minutes = 30;
		start_time.setHours(hours);
		start_time.setMinutes(minutes);

		//get contest_duration 
		var get_contest_duration = schedule.scheduleJob(start_time, function(){
			console.log("Getting contest duration at: " + start_time); 
			
			var get_contest_duration_options={
				host: 'developer.kb.dexit.co',
				port: 80,
				path: '/access/stores/'+datastore+'/query/?query='+encodeURIComponent(contest_duration_query), //encode query 
				method: 'GET',
				headers: { 
					'Authorization' : 'Bearer '+ tokenString,
					'Accept' : 'application/json',
					'Name' : 'Value'
				}
			};  
			
			//http request 
			req = http.request(get_contest_duration_options,function(res){
				//encode in utf8 
				res.setEncoding('utf8');
			
				res.on('data',function(res2){
					var contest_duration_message = JSON.parse(res2);
					console.log("Contest Duration = " + contest_duration_message.result.rows[0][0]); //get the contest duration from the query 
					contest_duration = contest_duration_message.result.rows[0][0];
				});
			});
		
		//end request 	
		req.end();			
			
		}); //end of get_contest_duration 
		
		//get winner_selection_duration 
		var get_winner_selection_duration = schedule.scheduleJob(start_time, function(){
			console.log("Getting winner selection duration at: " + start_time); 
			
			var get_winner_selection_duration_options={
				host: 'developer.kb.dexit.co',
				port: 80,
				path: '/access/stores/'+datastore+'/query/?query='+encodeURIComponent(winner_selection_duration_query), //encode query 
				method: 'GET',
				headers: { 
					'Authorization' : 'Bearer '+ tokenString,
					'Accept' : 'application/json',
					'Name' : 'Value'
				}
			};  
			
			//http request 
			req = http.request(get_winner_selection_duration_options,function(res){
				//encode in utf8 
				res.setEncoding('utf8');
			
				res.on('data',function(res2){
					var winner_selection_duration_message = JSON.parse(res2);
					console.log("Winner Selection Duration = " + winner_selection_duration_message.result.rows[0][0]); //get the winner selection duration from the query 
					winner_selection_duration = winner_selection_duration_message.result.rows[0][0];
				});
			});
		
		//end request 	
		req.end();			
			
		}); //end of get_winner_selection_duration 
		

		
		
	}); //end of content post 


app.use('/client', express.static('public'));

////////////


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
