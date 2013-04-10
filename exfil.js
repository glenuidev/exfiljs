/* 

exfil (https://github.com/glenuidev/exfiljs): an application that will
 - start a node server on your local host
 - fetch bits of html from a url using jquery selectors

 example: http://localhost:7070/?curl=https://twitter.com/search?q=nodejs&src=tyah&qid=.stream-container

 features:

 - specify optional port with serverPort constant
 - debug mode (stdout dump): true/false
 - content type: switches to text when in debug mode

 todo: 

 - need to make selector escape more robust
 - need to make parsing nodes which contain js more robust

*/

(function  (){
// setup
var http		= require('http'),
	url 		= require('url'),
	jsdom		= require('jsdom'),
	debugOn		= false,
	serverPort	= 7070,
	contentType	= debugOn ? "text/plain" : "text/html",
	jquerySrc	= "",
	currUrl		= null,
	currChunk	= null,
	jqInclude,
	makeServer,
	echo;

jqInclude = {
	host: 'ajax.googleapis.com',
	port: '80',
	path: '/ajax/libs/jquery/1.7.1/jquery.min.js'	
}

// jsdom config
/* jsdom.defaultDocumentFeatures = {
	FetchExternalResources   : ['script'],
	ProcessExternalResources : false,
	MutationEvents           : '2.0',
	QuerySelector            : true
}
*/

// run before server starts, get jquery loaded into string
http.get(jqInclude, function(res) {
	// quit if jquery gets 404
	if (res.statusCode == "404") {
		reqBarf(res);
		echo("can't start exfil service");
		return;
	};
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		jquerySrc += chunk;
	});
	res.on('end', function(){
		//echo(jquerySrc);
		console.log("jquery loaded successfully, starting web server now");
		makeServer();		
	});
}).on('error', function(e) {
	echo("Something bad happened while trying to load jquery: " + e.message);
	return;
});	 


// start exfil server
makeServer = function(){
	http.createServer(function(request, response) {
		// REQUEST
		// punt if favicon request
		if (request.url == "/favicon.ico") {return};
		
		// assumes good request (to-do: make beefier fallbacks)
		echo('processing request...');
		var urlParams = url.parse(request.url, true),
				curl      = urlParams.query['curl']  || null,
				qid       = urlParams.query['qid']   || null,
				cached; 

		// proceed if we have good params from url
		if (qid != null && curl != null) {
			cached = (currUrl == curl); 
			echo('url: '      + curl);
			if (currUrl == curl) {echo('url already loaded!!');};
			echo('selector: ' + qid);
			// RESPONSE		
			response.writeHead(200, {"Content-Type": contentType});
  
			if (cached) {
				echo('doing the cached version');
				//echo('current chunk is: ' + currChunk);
			} else {
				echo('doing the slow version');
				currChunk = null;
			}
			
			jsdom.env({
				html: (currChunk || curl), 
				src: [jquerySrc],
				done: function(errors, window) {
					currUrl = curl;
					//echo('current chunk: ' + currChunk);
					echo('errors: ' + errors);
					if ( errors ) {
						echo(JSON.stringify(errors));
						response.write('error, please verify url');
						response.end();
					} else {
						var jQuery  = window.jQuery,
								content = jQuery(qid),
								chunk   = content.clone().wrap('<div>').parent().html();
						response.write(chunk); 
						response.end();
						currChunk = (currChunk || jQuery('html').html());
						echo("chunk cached and sent to browser");
					}
				}
			});
		} else {
			echo('no params supplied');
			return;
		}
	}).listen(serverPort);
	console.log('server started on port: ' + serverPort);
};

echo = function (msg) { 
	debugOn && console.log(msg);
};

})();
