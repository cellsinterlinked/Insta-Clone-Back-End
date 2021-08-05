const HttpError = require('../models/http-error');
const { validationResult} = require('express-validator')
const Post = require('../models/post')
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const mongooseUniqueValidator = require('mongoose-unique-validator');


const getAllPosts = async (req, res, next) => {
  let posts
  try {
    posts = await Post.find();
  } catch (err) {
    const error = new HttpError('Something went wrong. Could not fetch posts', 500)
    return next(error)
  }

  res.json({ posts: posts.map(post => post.toObject({ getters: true}))})
}



const getPostById = async (req, res, next) => {
  const postId = req.params.pid;

  let post

  try {
    post =  await Post.findById(postId)
  } catch (err) {
    const error = new HttpError('Something went wrong', 500 )
    return next(error)
  }


  if (!post) {
    const error =  new HttpError('Could not find a post for the provided id.', 404);
    return next(error)
  }

  res.json({ post: post.toObject( {getters: true}) });
};

const getPostsByUserName = async (req, res, next) => {
  const userId = req.params.uid;
  let user;

  try {
    user = await User.findOne({ userName: userId})
  } catch (err) {
    const error = new HttpError('Something went wrong. Could not fetch posts', 500)
    return next(error)
  }

  let posts;

  try {
    posts = await Post.find({ user: user.id })  // this is a mongoDB thing. 
  } catch (err) {
    const error = new HttpError('Something went wrong. Could not fetch posts', 500)
    return next(error)
  }

  if (!posts || posts.length === 0) {
    const error =  new HttpError('Could not find any posts for the provided user.', 404);
    return next(error)
  }
  res.json({ posts: posts.map(post => post.toObject({ getters: true})) });

  

  res.json({ posts: posts.toObject( {getters: true}) });
};








const getTaggedPosts = async (req, res, next) => {
  const userName = req.params.uid;
  let posts;

  try {
    posts = await Post.find();
  } catch (err) {
    const error = new HttpError('Could not fetch posts to sort', 500)
    return next(error)
  }

  const newPosts = posts.filter(post => post.tags.includes(userName))

  if (newPosts.length === 0 || !newPosts) {
    return new HttpError('no posts with this user tagged', 500)
  }

  res.json({ posts: newPosts.map(post => post.toObject({ getters: true}))})



}








const getFollowedPosts = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  let posts;

  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('could not find a user by that ID', 500);
    return next(error)
  }

  const newArr = [...user.following];

  if (user.following.length === 0 ) {
    const error = new HttpError('This user is not following anyone', 500);
    return next(error);
  }

  try {
    posts = await Post.find().where('user').in(newArr).exec()
  } catch (err) {
    const error = new HttpError('Could not get the posts of these users', 500);
    return next(error);
  }
  
  res.json({ posts: posts.map(post => post.toObject({ getters: true}))})
}


const getPostsByUser = async (req, res, next) => {
  const userId = req.params.uid;
  let posts;

  try {
    posts = await Post.find({ user: userId })  // this is a mongoDB thing. 
  } catch (err) {
    const error = new HttpError('Something went wrong. Could not fetch posts', 500)
    return next(error)
  }

  if (!posts || posts.length === 0) {
    const error =  new HttpError('Could not find any posts for the provided user.', 404);
    return next(error)
  }
  res.json({ posts: posts.map(post => post.toObject({ getters: true})) });
};




const createPost = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  // if there are errors 
      console.log(errors);
      return next(
        new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422)
        ) 
    }

  const {image, user, description, tags, hashTags} = req.body
  const monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  const year = today.getFullYear()
  const codeTime = today.getTime()
  const stringMonth = monthArray[month - 1]

  const createdPost = new Post({
    image,
    description,
    user,
    comments: [],
    likes: [],
    date: {fullDate: today, month: month, day: day, year: year, time:codeTime, monthString: stringMonth},
    hashTags,
    tags
  })

  let account;

  try {
    account =  await User.findById(user);
  } catch(err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }

  if (!account) {
    const error = new HttpError('Could not find user for provided ID', 500)
    return next(error)
  }

  try {
    const sess = await mongoose.startSession(); // all the next 5 lines are done in this one session, if something goes wrong it roles the whole thing back. 
    sess.startTransaction();
    await createdPost.save({ session: sess })
    account.posts.push(createdPost);
    await account.save({ session: sess })
    await sess.commitTransaction();

  } catch (err) {
    const error = new HttpError(
      'Creating post failed when trying to add to MongoDB.',
      500
    )
    return next(error)    // so this will stop running if we have an error
  }


  res.status(201).json({post: createdPost})
}




const updatePost = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  // if there are errors 
      console.log(errors);
      return next(
        new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422)
        ) 
    }


  const {image, description} = req.body
  const postId = req.params.pid;   // grabs the parameters from the url the patch request was made to 

  let post;

  try {
    post = await Post.findById(postId)
  } catch(err) {
    const error = new HttpError('Something went wrong, could not fetch this post', 500)
    return next(error)
  }
  
  post.image = image;
  post.description = description;

  try {
    await post.save();
  } catch(err) {
    const error = new HttpError('Could not update post.', 500)
    return next(error)
  }


  res.status(200).json({post: post.toObject({ getters: true})});


}


const updatePostComments = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  // if there are errors 
      console.log(errors);
      return next(
        new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422)
        ) 
    }

  const {commentor, comment} = req.body;
  let id = uuidv4();
  const postId = req.params.pid;
  let post 
  let user

  const monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  const year = today.getFullYear()
  const codeTime = today.getTime()
  const stringMonth = monthArray[month - 1]

  try {
    post = await Post.findById(postId)
  } catch(err) {
    const error = new HttpError('Something went wrong, cant find that post', 500)
    return next(error)
  }

  try {
    user = await User.findById(commentor)
  } catch(err) {
    const error = new HttpError('Could not find your user Id', 500)
    return next(error)
  }
  
  post.comments = [...post.comments, {id: id, user: commentor, comment: comment, userName: user.userName, date:{fullDate: today, month: month, day: day, year: year, time:codeTime, monthString: stringMonth}}]

  try {
    await post.save();
  } catch(err) {
    const error = new HttpError('saving this comment didnt work.', 500)
    return next(error)
  }
  

  res.status(200).json({post: post.toObject({ getters: true})})
}





const updatePostLikes = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  // if there are errors 
      console.log(errors);
      return next(
        new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422)
        ) 
    }
    const { user } = req.body;
    const postId = req.params.pid;
    let post;

    try {
      post = await Post.findById(postId)
    } catch (err) {
      const error = newHttpError('Could not find a post with that ID', 500)
      return next(error)
    }

    if (post.likes.includes(user)) {
      post.likes = post.likes.filter(u => u !== user)
    } else {
      post.likes = [...post.likes, user]
    }

    try {
      await post.save()
    } catch(err) {
      const error = new HttpError('Could not adjust likes on this post', 500)
      return next(error)
    }

    res.status(200).json({message: 'Like Adjusted'})
}






const deletePost = async (req, res, next) => {
  const postId = req.params.pid;
  let post;
  try {
    post = await Post.findById(postId).populate('user');
  } catch(err) {
    const error = new HttpError('Could not find a post with the given id', 500)
    return next(error)
  }

  if (!post) {
    const error = new HttpError('Could not find a post for this id', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await post.remove({ session: sess})
    post.user.posts.pull(post);
    await post.user.save({session: sess})
    await sess.commitTransaction();
  } catch(err) {
    const error = new HttpError('Could not delete this post', 500)
    return next(error)
  }

  res.status(200).json({message: 'post deleted'})
}


const deleteComment = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  // if there are errors 
      console.log(errors);
      return next(
        new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422)
        ) 
    }


  const { postId, userId } = req.body;
  // may need to first determine if userId is the user of the post or the user of the comment 
  const commentId = req.params.cid;
  let post;

  try {
    post = await Post.findById(postId)
  } catch (err) {
    const error = new HttpError('Could not find the post with given ID', 500)
    return next(error)
  }

  post.comments = post.comments.filter(comment => comment.id !== commentId);

  try {
    await post.save()
  } catch(err) {
    const error = new HttpError('deleting this comment did not work!', 500)
    return next(error)
  }

  res.status(200).json({message: 'comment deleted'})


}

exports.getTaggedPosts = getTaggedPosts
exports.getAllPosts = getAllPosts;
exports.getPostById = getPostById;
exports.getPostsByUser = getPostsByUser;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.updatePostComments = updatePostComments;
exports.deletePost = deletePost;
exports.deleteComment = deleteComment
exports.updatePostLikes = updatePostLikes;
exports.getFollowedPosts = getFollowedPosts;
exports.getPostsByUserName= getPostsByUserName;
