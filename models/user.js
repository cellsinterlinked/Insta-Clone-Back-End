const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  following: { type: Array, required: true },
  followers: { type: Array, required: true },
  posts: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Post'}],
  conversations: [{type: mongoose.Types.ObjectId, required: true, ref: 'Convo'}],
  image: { type: String, required: false},
  saves: { type: Array, required: true},
  webSite: {type: String, required: false},
  bio: {type: String, required: false},
  phone: {type: String, required: false},
  gender: {type: String, required: false},
  activity: {type: Array, required: false},
  activityNotifications: {type: Number, required: false},
  followedHash: {type: Array, required: false}

})

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);