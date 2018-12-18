const crypto = require('crypto')
const config = require('../config')
const https = require('https')
const querystring = require('querystring')

var helpers = {}

helpers.hash = function(str) {
	if(typeof(str) == 'string' && str.length > 0) {
		var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
		 return hash
	}
	else {
		return false
	}
}

helpers.parseJsonToObject = function(str) {
	try {
		var obj = JSON.parse(str);
	}
	catch(e) {
		return {}
	}
	return obj
}

helpers.createRandomString = function(length) {
	length = typeof(length)=='number' && length > 0 ? length : false
	if(length) {
		var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'
		var str = ''

		for(var i = 1; i <= length; i++) {
			var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
			str += randomCharacter
		} 	
		
		return str
	
	}
	else {
		return false
	}
}

helpers.sendTwilioSms = function (phone, msg, callback) {
	phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone : false
	msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false
	if(phone && msg) {
		var payload = {
			'From' : config.twilio.fromPhone,
			'To' : '+1'+phone,
			'Body' : msg
		}

		var stringPayload = querystring.stringify(payload)

		var requestDetails = {
			'protocol' : 'https:',
			'hostname' : 'api.twilio.com',
			'method' : 'POST',
			'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
			'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
			'headers' : {
				'Content-Type' : 'application/x-www-form-urlencoded',
				'Content-Length' : Buffer.byteLength(stringPayload)
			}
		}

		var req = https.request(requestDetails, function(res) {
			var status = res.statusCode
			if(status == 200 || status == 201) {
				callback(false)
			}
			else {
				callback('Status code returned was ' + status)
			}
		})

		req.on('error', function(e) {
			callback(e)
		})

		req.write(stringPayload)

		req.end()
	}
	else {
		callback('Given parameters were missing or invalid')
	}
}

module.exports = helpers
