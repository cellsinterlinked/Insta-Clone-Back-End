const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const postSchema = new Schema({
  image: { type: String, required: true},
  description: { type: String, required: true},
  user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  comments: { type: Array},
  likes: { type: Array},
  date: {type:Object},
  hashTags: { type: Array},
  tags: { type: Array}
})


module.exports = mongoose.model('Post', postSchema);