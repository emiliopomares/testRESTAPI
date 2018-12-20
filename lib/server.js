

const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('../config')
const fs = require('fs')
const _data = require('./data')
const handlers = require('./handlers')
const helpers = require('./helpers')
const path = require('path')

const server = {}

server.credentials = 
{
	cert: fs.readFileSync(path.join(__dirname,'../ssl/cert.pem')),
	key: fs.readFileSync(path.join(__dirname,'../ssl/key.pem'))
}

server.serverFunction = function(req, res) {

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

                var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;
		console.log("typeof:" + typeof(server.router[trimmedPath]))
                var data = {
                        'trimmedPath' : trimmedPath,
                        'queryStringObject' : queryStringObject,
                        'method' : method,
                        'headers' : headers,
                        'payload' : helpers.parseJsonToObject(buffer)
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


server.httpServer = http.createServer(server.serverFunction)
server.httpsServer = https.createServer(server.credentials, server.serverFunction)





server.init = function() {
        server.httpServer.listen(config.httpPort, function() {

                console.log('http server started on port ' + config.httpPort + ' in ' + config.envName + ' mode')
        
        })
        server.httpsServer.listen(config.httpsPort, function() {

                console.log('https server started on port ' + config.httpsPort + ' in ' + config.envName + ' mode')
        
        })
}


server.router = {
	'sample' : handlers.sample,
	'ping': handlers.ping,
	'users': handlers.users,
	'checks': handlers.checks,
	'tokens' : handlers.tokens
}

module.exports = server