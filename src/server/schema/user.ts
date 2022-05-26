var mongoose = require('../mongoDB/index')

var Schema = mongoose.Schema

var UserSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  password: { type: String }
})

module.exports = mongoose.model('User', UserSchema)
