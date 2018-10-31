/* primary file for the API
 *
 */

const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')
const fs = require('fs')

const certFile = fs.readFileSync('./ssl/cert.pem')
const keyFile = fs.readFileSync('./ssl/key.pem')

const credentials = 
{
	cert: certFile,
	key: keyFile
}

function serverFunction(req, res) {

	var parsedURL = url.parse(req.url, true)

        var path = parsedURL.pathname
        var trimmedPath = path.replace(/^\/+|\/+$/g, '')


        var queryStringObject = parsedURL.query;

        console.log("query: " + JSON.stringify(queryStringObject))


        var components = trimmedPath.split('/')


        var method = req.method.toLowerCase()


        var headers = req.headers;
        console.log("Headers are: ", headers);

	if(components[0] == "service") {
                console.log("Service requested");
        }
        else {
                console.log("File requested");
        }


        var decoder = new StringDecoder('utf-8')
        var buffer = ''
        req.on('data',function(data) {
                buffer += decoder.write(data)
        })
        req.on('end',function() {
                buffer += decoder.end()

                var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

                var data = {
                        'trimmedPath' : trimmedPath,
                        'queryStringObject' : queryStringObject,
                        'method' : method,
                        'headers' : headers,
                        'payload' : buffer
                }

		chosenHandler(data, function(statusCode, payload) {
                        statusCode = typeof(statusCode) == 'number' ? statusCode : 200
                        payload = typeof(payload) == 'object' ? payload : {}
                        var payloadString = JSON.stringify(payload)
                        res.setHeader('Content-Type', 'application/json')
                        res.writeHead(statusCode)
                        res.end(payloadString)
                })



        })



}


const httpServer = http.createServer(serverFunction)
const httpsServer = https.createServer(credentials, serverFunction)

httpServer.listen(config.httpPort, function() {

	console.log('http server started on port ' + config.httpPort + ' in ' + config.envName + ' mode')

})

httpsServer.listen(config.httpsPort, function() {

	console.log('https server started on port ' + config.httpsPort + ' in ' + config.envName + ' mode')

})

var handlers = {}

handlers.ping = function(data, callback) {
	callback(200)
}

handlers.sample = function(data, callback) {
	callback(406, {'name':'sample handler'})	
}

handlers.notFound = function(data, callback) {
	callback(404, {'returnCode':'Not found'})
}

var router = {
	'sample' : handlers.sample,
	'ping': handlers.ping
}
