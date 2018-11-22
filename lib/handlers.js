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

handlers.users = function(data, callback) {
	var acceptableMethods = ['post', 'get', 'put', 'delete']

	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback)
	}
	else {
		callback(405);
	}
}

var _data = require('./data')
var helpers = require('./helpers')

handlers._users = {};
// data: firstName, lastName, phone, passwd, tosAgreemt
handlers._users.post = function(data, callback) {

	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
	var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false

	if(firstName && lastName && phone && password && tosAgreement) {
		_data.read('users', phone, function(err, data) {
			if(err) {
				var hashedPassword = helpers.hash(password)
				if(hashedPassword) {
					var userObject = {
						'firstName' : firstName,
						'lastName' : lastName,
						'phone' : phone,
						'hashedPassword' : hashedPassword,
						'tosAgreement' : true
					}
					_data.create('users', phone, userObject, function(err, data) {
						if(!err) {
							callback(200)
						}
						else {
							console.log("Erratum : " + err)	
							callback(400, {'Error':'A user with that phone number already exists'})
						}		
					})
				}
				else {
					callback(500, {'Error' : 'Could not hash the user\'s password'})
				}
			}
			else {
				callback(400, {'Error': 'A user with that phone number already exists'})
			}
		})	
	}
	else {
		callback(400, {'Error' : 'Missing required fields'})
	}
}

handlers._users.get = function(data, callback) {
	var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone : false
	if(phone) {
		_data.read('users', phone, function(err, data) {
			if(!err && data) {
				delete data.hashedPassword
				callback(200, data)
			} else {
				callback(404)
			}
		})
	} else {
		callback(400, {'Error': 'Missing required field'})
	}
}

handlers._users.put = function(data, callback) {
	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone : false

	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

	if(phone) {
		if(firstName || lastName || password) {
			_data.read('users', phone, function(err, userData) {
				if(!err && userData) {
					if(firstName) {
						userData.firstName = firstName
					}
					if(lastName) {
						userData.lastName = lastName
					}
					if(password) {
						userData.hashedPassword = helpers.hash(password)
					}
					_data.update('users', phone, userData, function(err) {
						if(!err) {
							callback(200)
						}
						else {
							console.log(err)
							callback(500, {'Error': 'Could not update the user'})
						}
					})
				} else {
					callback(400, {'Error':'The specified user does not exist'})
				}
			})
		}
		else {
			callback(400, {'Error': 'Missing fields to update'})
		}
	}
	else {
		callback(400, {'Error': 'Missing required field'})
	}

}

handlers._users.delete = function(data, callback) {
	var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone : false
	if(phone) {
		_data.read('users', phone, function(err, data) {
			if(!err && data) {
				_data.delete('users',phone,function(err) {
					if(!err) {
						callback(200)
					}
					else {
						callback(500, {'Error':'Could not delete the specified user'})
					}	
				})
			} else {
				callback(400, {'Error':'Could not find specified user'})
			}
		})
	} else {
		callback(400, {'Error': 'Missing required field'})
	}
}

module.exports = handlers
