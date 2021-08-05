const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const convoSchema = new Schema({
  users: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User'}],
  messages: {type: Array, required: true}
  
})

module.exports = mongoose.model('Convo', convoSchema)