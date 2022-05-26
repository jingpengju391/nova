console.log('初始化mongo')
var mongoose = require('mongoose')
const DB_URL = 'mongodb://localhost:27017'
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connection.on('connected', function() {
  console.log('Mongoose connection open to ' + DB_URL)
})

mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error:' + err)
})

mongoose.connection.on('disconnectied', function() {
  console.log('Mongoose connection disconnected')
})

module.exports = mongoose
