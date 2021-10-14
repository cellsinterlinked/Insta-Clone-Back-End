const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const convoSchema = new Schema({
  users: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User'}],
  messages: {type: Array, required: true},
  notifications: {type: Object, blackbox: true}
  
})

module.exports = mongoose.model('Convo', convoSchema)