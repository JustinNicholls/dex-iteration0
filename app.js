var testduration;
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
  , schedule = require ('node-schedule'); 
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
//global variables for queries 
var start_query = "UPDATE contest_sc_intelligence SET current_msg=(SELECT starting_msg FROM contest_configuration), game_state = 'started'";
var end_query = "UPDATE contest_sc_intelligence SET current_msg=(SELECT final_msg FROM contest_configuration), game_state = 'final'";
var choose_winner_query= "UPDATE contest_sc_intelligence SET game_state = 'winner'";
var contest_duration_query = "SELECT contest_duration FROM contest_configuration";
var winner_selection_duration_query = "SELECT winner_selection_duration FROM contest_configuration";
var pick_winner_query = "UPDATE contest_sc_intelligence SET winner=(SELECT name FROM finalist ORDER BY score DESC LIMIT 1), game_state = 'not_started'";

//start the content 
app.post('/content', function(res, req){
		//variables 
		var datastore = res.body.datastore; //get datastore 
		var contest_duration; //contest duration time that will be retrieved from database
		var winner_selection_duration; //winner_selection_duration that will be retrieved from database 
		
		
		//create new time that will be the time needed to schedule the start 
		var start_time = new Date();
		//set hour and minutes here 
		var hours = 21;
		var minutes = 02;
		start_time.setHours(hours);
		start_time.setMinutes(minutes); 
		
		//start the contest at start_time
		var start_contest = schedule.scheduleJob(start_time, function(){
			console.log("Contest will start at: " + start_time);

			var start_message_options = {
				host: 'developer.kb.dexit.co',
				port: 80,
				path: '/access/stores/'+datastore+'/query/?query='+encodeURIComponent(start_query), //encoding query 
				method: 'GET',
				headers: { 
					'Authorization' : 'Bearer '+ accessTokenString,
					'Accept' : 'application/json'
				}
			};
			
			//send http request with options	
			req = http.request(start_message_options,function(res){
				res.setEncoding('utf8');
				
				res.on('data',function(res2){
					
				});
			});
			//trigger event 
			content_playlist();
			//end request 
			req.end();
			
			var get_contest_duration;
			
			var newtime = new Date();
			newtime.setHours(hours);
			newtime.setMinutes(minutes+1); 
			//get contest_duration at start_time 
			get_contest_duration = schedule.scheduleJob(newtime, function(){

				console.log("Getting contest duration at: " + newtime); 
			
				var get_contest_duration_options={
					host: 'developer.kb.dexit.co',
					port: 80,
					path: '/access/stores/'+datastore+'/query/?query='+encodeURIComponent(contest_duration_query), //encode query 
					method: 'GET',
					headers: { 
						'Authorization' : 'Bearer '+ accessTokenString,
						'Accept' : 'application/json'
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
						testduration = parseInt(contest_duration_message.result.rows[0][0]);
					});
				});
				//testduration = parseInt(req.contest_duration);
			//end request 	
			req.end();			
			
			}); //end of get_contest_duration
			
			
			//new time object to set the time when the contest will end 
			//var end_time = start_time; 
			//end_time.setMinutes((parseInt(minutes)+parseInt(contest_duration)));
			console.log(testduration);
			var end_time= new Date();
			end_time.setHours(hours);
			end_time.setMinutes(parseInt(minutes)+testduration); 
			//console.log(end_time);
			//end the contest 
			var end_contest = schedule.scheduleJob(end_time, function(){
				console.log("Contest will end at: " + end_time);
				
				var end_contest_options= {
					host: 'developer.kb.dexit.co',
					port: 80,
					path: '/access/stores/'+datastore+'/query/?query='+encodeURIComponent(end_query), //encode query 
					method: 'GET',
					headers: { 
						'Authorization' : 'Bearer '+ accessTokenString,
						'Accept' : 'application/json'
					}
				};
				
				//send http request with options 	
				req = http.request(end_contest_options,function(res){
					res.setEncoding('utf8'); //encode in utf8 
					
					res.on('data',function(res2){
						console.log("Contest has ended"); 
					});
				});
				//trigger content playlist event 
				content_playlist();
				
				//end request 
				req.end(); 
				
				//get winner_selection_duration at end_time 
				var get_winner_selection_duration = schedule.scheduleJob(end_time, function(){
				console.log("Getting winner selection duration at: " + end_time); 
			
				var get_winner_selection_duration_options={
					host: 'developer.kb.dexit.co',
					port: 80,
					path: '/access/stores/'+datastore+'/query/?query='+encodeURIComponent(winner_selection_duration_query), //encode query 
					method: 'GET',
					headers: { 
						'Authorization' : 'Bearer '+ accessTokenString,
						'Accept' : 'application/json'
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
				//trigger event 
				content_playlist(); 
		
				//end request 	
				req.end();			
			
				}); //end of get_winner_selection_duration 
					
				
				//new time object to set the time to select winner 
				var choose_winner_time = start_time; 
				choose_winner_time.setMinutes(parseInt(minutes)+parseInt(contest_duration)+parseInt(winner_selection_duration)); //NOTE 
				
				//choose winner 				
				var choose_winner = schedule.scheduleJob(choose_winner_time, function(){
					console.log("Contest will choose winner at: " + choose_winner_time);
					
					//choose winner message options 
					var choose_winner_options = {
						host: 'developer.kb.dexit.co',
						port: 80,
						path: '/access/stores/'+datastore+'/query/?query='+encodeURIComponent(choose_winner_query), //encode query 
						method: 'GET',
						headers: { 
							'Authorization' : 'Bearer '+ accessTokenString,
							'Accept' : 'application/json'
						}
					};
					
					//http request for choose winner 	
					req = http.request(choose_winner_options,function(res){
						res.setEncoding('utf8'); //encode in utf8 
						
						res.on('data',function(res2){
							//Nothing need be done here
						});
					});
					//content playlist trigger 
					content_playlist();
					
					//end the request 
					req.end();
				}); //choose_winner ends here 
			
			}); //end_contest ends here
		}); //start_contest ends here 
		
}); //end of content post 


//pick_winner method 
app.post('/winner', function(res, req){
	var datastore = res.body.datastore;
	var winner = "";
	
	var pick_winner_options = {
			host: 'developer.kb.dexit.co',
			port: 80,
			path: '/access/stores/'+datastore+'/query/?query='+encodeURIComponent(pick_winner_query),
			method: 'GET',
			headers: { 
				'Authorization' : 'Bearer '+ accessTokenString,
				'Accept' : 'application/json'
			}
	};
		
	req = http.request(pick_winner_options,function(res){
		//encode in utf8
		res.setEncoding('utf8');
			
		res.on('data',function(res2){
			var pick_winner_message = JSON.parse(res2);
			console.log("Winner is: " + pick_winner_message.result.rows[0][3]); 
			winner = pick_winner_message.result.rows[0][3];			
		});
	});
	//end the request 
	req.end();
		

	//trigger the event 
	content_playlist();
		
});



//
app.use('/client', express.static('public'));

////////////


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
