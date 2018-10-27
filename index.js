/* primary file for the API
 *
 */

const http = require('http')
const url = require('url')

const port = 3000

const server = http.createServer(function(req, res) {

	var parsedURL = url.parse(req.url, true)

	var path = parsedURL.pathname
	var trimmedPath = path.replace(/^\/+|\/+$/g, '')

	
	var queryStringObject = parsedURL.query;

	console.log("query: " + JSON.stringify(queryStringObject))


	var components = trimmedPath.split('/')


	var method = req.method.toLowerCase()

	if(components[0] == "service") {
		console.log("Service requested");
	}
	else {
		console.log("File requested");
	}

	res.end('shit\n')

	console.log('Request received on path: ' + trimmedPath + ' (' + method + ')')

})

server.listen(port, function() {

	console.log('server started on port ' + port)

})

