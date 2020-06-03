const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const bodyParser = require('body-parser');

const userSchema = new mongoose.Schema({
  admin: {
    type: Boolean,
    default: false,
  },
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

module.exports = User;