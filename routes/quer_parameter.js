/**
 * New node file
 */

exports.parameterfunction = function(req,res){
	
	var data = '';
	var id = req.params.id;
	
	req.on('data', function(chunk){
		data += chunk;
	});
	
	
	
	req.on('end', function (){
		
		res.writeHead(200, { 'Content-Type': 'application/json'});
		res.end(JSON.stringify({ message: 'id=' + ' is what you entered as id' }));
	});
	
	req.on('err', function (){
		res.writeHead(400, { 'Content-Type': 'application/json'});
		res.end(JSON.stringify({ message: 'bad request' }));
	});

}

exports.post = function(req, res){
	
	var data = '';
	data = req.body;
	console.log("data="+JSON.stringify(data));
	
	if(data != ''){
		res.writeHead(200, { 'Content-Type': 'application/json'});
		res.end(JSON.stringify({ message: 'Added: '+JSON.stringify(data) }));
	}
	else{
		res.writeHead(404, { 'Content-Type': 'application/json'});
		res.end(JSON.stringify({ message: 'nothing to Add' }));
	}
};

exports.put = function(req, res){
	var data = '';
	data = req.body;
	console.log("data="+JSON.stringify(data));
	
	if(data != ''){
		res.writeHead(200, { 'Content-Type': 'application/json'});
		res.end(JSON.stringify({ message: 'Updated: '+JSON.stringify(data) }));
	}
	else{
		res.writeHead(404, { 'Content-Type': 'application/json'});
		res.end(JSON.stringify({ message: 'nothing to update' }));
	}
	
};

exports.post_quaryParameter = function(req, res){
	
	var data = '';
	var id = req.params.id;
	data = req.body;
	console.log("data="+JSON.stringify(data));
	
	if(data != ''){
		res.writeHead(200, { 'Content-Type': 'application/json'});
		res.end(JSON.stringify({ message: 'Added: '+JSON.stringify(data)+"with id= "+id }));
	}
	else{
		res.writeHead(404, { 'Content-Type': 'application/json'});
		res.end(JSON.stringify({ message: 'id=' + id + 'does not exist' }));
	}
};


exports.pick_winner = function(req, res){
	var data = '{"id": , "datastore": }'; 
	var id = req.params.id; 
	data = req.body;
	console.log("data="+JSON.stringify(data));
	
	if(data != ''){
		res.writeHead(200, { 'Content-Type': 'application/json'});
		res.end(JSON.stringify({ message: 'Added: '+JSON.stringify(data)+"with id= "+id }));
	}
	else{
		res.writeHead(404, { 'Content-Type': 'application/json'});
		res.end(JSON.stringify({ message: 'id=' + id + 'does not exist' }));
	}
	
}; 
