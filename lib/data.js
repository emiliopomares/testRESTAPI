var fs = require('fs')
var path = require('path')
var helpers = require('./helpers')

var lib = {}

lib.baseDir = path.join(__dirname, "/../.data/")

lib.create = function(dir, file, data, callback) {

	fs.open(lib.baseDir + dir + "/" + file + ".json", "wx", function(err, fileDescriptor) {

		if(!err && fileDescriptor) {
			var stringData = JSON.stringify(data)

			fs.writeFile(fileDescriptor, stringData, function(err) {
				if(!err) {
					fs.close(fileDescriptor, function(err) {
						if(!err) callback(false);
						else callback('Error: could not close new file')
					})
				}
				else {
					callback('Error: could not write to new file')
				}
			})
		}
		else {
			callback('Error: could not create a file, it may already exist')
		}

	})

}

lib.read = function(dir, file, callback) {
	
	fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function(err, data) {
		if(!err && data) {
			var parsedData = helpers.parseJsonToObject(data)
			callback(false, parsedData)
		}
		else {
			callback(err, data)
		}

	})

}

lib.update = function(dir, file, data, callback) {
	
	fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function(err, fileDescriptor) {
		if(!err && fileDescriptor) {
			var stringData = JSON.stringify(data)
			fs.ftruncate(fileDescriptor, function(err) {
				if(!err) {
					fs.writeFile(fileDescriptor, stringData, function(err) {
						if(!err) {
							fs.close(fileDescriptor, function(err) {
								if(!err) callback(false)
								else callback('Error: could not close the file')
							})
						}
						else {
							callback('Error: could not write to file')
						}
					})
				}
				else {
					callback('Error: could not truncate file')
				}
			})
		}
		else {
			callback('Error: could not open the file for updating, it may not exist yet')
		}
	})

}

lib.delete = function(dir, file, callback) {

	fs.unlink(lib.baseDir + dir + '/' + file + '.json', function(err) {
		if(!err) {
			callback(false)
		}
		else {
			callback('Error: could not delete file ' + err)
		}
	})

}

lib.list = function(dir, callback) {

	fs.readdir(lib.baseDir+dir+'/', function(err, data) {
		if(!err && data && data.length > 0) {
			var trimmedFilesNames = []
			data.forEach(function(fileName) {
				trimmedFilesNames.push(fileName.replace('.json', ''))
			})
			callback(false, trimmedFilesNames)
		}
		else {
			callback(err, data)
		}
	})

}

module.exports = lib
