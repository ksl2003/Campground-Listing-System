const { required } = require("joi");
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
// const findOrCreate = require("mongoose-findorcreate");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
  },
});
userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);

const User = mongoose.model("user", userSchema);

module.exports = User;
