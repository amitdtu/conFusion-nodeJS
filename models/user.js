const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const bodyParser = require('body-parser');

const User = new mongoose.Schema({
  admin: {
    type: Boolean,
    default: false,
  },
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
