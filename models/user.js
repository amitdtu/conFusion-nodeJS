const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const bodyParser = require('body-parser');

const User = new mongoose.Schema({
  firstname: {
    type: String,
    default: '',
  },
  lastname: {
    type: String,
    default: '',
  },
  facebookId: String,
  admin: {
    type: Boolean,
    default: false,
  },
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
