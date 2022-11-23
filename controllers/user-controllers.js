const HttpError = require('../models/http-error');
const User = require('../models/user');
const Post = require('../models/post');
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2


const getAllUsers =  async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password, -email');
  } catch (err) {
    const error = new HttpError('Fetching users failed', 500);
    return next(error);
  }

  res.json({ users: users.map(user => user.toObject({ getters: true }))})
  
}


const getPopularUsers = async (req, res, next) => {
  userId = req.params.uid
  let user;
  let users
  let popularUsers;

  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }

  try {
    users = await User.find({}, '-password, -email, -activity, -saves,  -phone');
  } catch (err) {
    const error = new HttpError('Fetching users failed', 500);
    return next(error);
  }

  popularUsers = users.filter(member => (member.id !== user.id  && !member.followers.includes(userId))).sort(function(a, b) {return b.followers.length - a.followers.length})
  

  // arrange this by how many followers (the most on top)

  res.json({ users: popularUsers.map(user => user.toObject({ getters: true }))})
}


const getAllFollowedUsers = async (req, res, next) => {
  userId = req.params.uid
  let user;
  let followedUsers;
  let users;

  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }
  let newArr = [...user.following]
  //now that we have the user data we can tap into user.following which is an array of all the id's of the users they follow;

  try {
    users = await User.find()
  } catch (err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }
  let usersArr = []

  for (let i = 0; i < users.length; i++) {
    usersArr.push(users[i].id)
  }

  let filteredArr = newArr.filter(user => usersArr.includes(user))

  if (user.following.length === 0) {
    const error = new HttpError('This user is not following anyone', 500);
    return next(error)
  }

  try {
    followedUsers = await User.find().where('_id').in(filteredArr).exec() 
  } catch(err) {
    const error = new HttpError('Could not establish the list of followed users', 500)
    return next(error)
  }
//they also can't contain the password or email
  res.json({ users: followedUsers.map(user => user.toObject({ getters: true }))})
}












const getAllProfileFollowing = async (req, res, next) => {
  userName = req.params.username
  let user;
  let followedUsers;
  let users

  try {
    user = await User.findOne({ userName: userName})
  } catch (err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }

  try {
    users = await User.find()
  } catch (err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }
  let usersArr = []

  for (let i = 0; i < users.length; i++) {
    usersArr.push(users[i].id)
  }

  let newArr = [...user.following]

  let filteredArr = newArr.filter(user => usersArr.includes(user))
 
  //now that we have the user data we can tap into user.following which is an array of all the id's of the users they follow;

  if (user.following.length === 0) {
    const error = new HttpError('This user is not following anyone', 500);
    return next(error)
  }

  try {
    followedUsers = await User.find().where('_id').in(filteredArr).exec() 
  } catch(err) {
    const error = new HttpError('Could not establish the list of followed users', 500)
    return next(error)
  }
//they also can't contain the password or email
  res.json({ users: followedUsers.map(user => user.toObject({ getters: true }))})
}




const getAllSaved = async (req, res, next) => {
  userId = req.params.uid
  let user;
  let saves;
  let posts;

  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }
  let newArr = [...user.saves]

  try {
    posts = await Post.find()
  } catch (err) {
    const error = new HttpError('Could not find posts', 500);
    return next(error)
  }

  let postsArr = []

  for (let i = 0; i < posts.length; i++) {
    postsArr.push(posts[i].id)
  }

  let filteredArr = newArr.filter(post => postsArr.includes(post))


  if (user.saves.length === 0) {
    const error = new HttpError('This user has no saves', 500);
    return next(error)
  }

  try {
     saves = await Post.find().where('_id').in(filteredArr).exec() 
  } catch(err) {
    const error = new HttpError('Could not establish the list of saved posts', 500)
    return next(error)
  }

  res.json({ posts: saves.map(post => post.toObject({ getters: true }))})
}




const getAllFollowing = async (req, res, next) => {
  userId = req.params.uid 
  let user;
  let followers;
  let users;

  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }
  let newArr = [...user.followers]

  if (user.followers.length === 0) {
    const error = new HttpError('This user is not followed by anyone', 500);
    return next(error)
  }

  try {
    users = await User.find()
  } catch (err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }
  let usersArr = []

  for (let i = 0; i < users.length; i++) {
    usersArr.push(users[i].id)
  }

  let filteredArr = newArr.filter(user => usersArr.includes(user))

  try {
    followers = await User.find().where('_id').in(filteredArr).exec() 
  } catch(err) {
    const error = new HttpError('Could not establish the list of followed users', 500)
    return next(error)
  }

  res.json({ users: followers.map(user => user.toObject({ getters: true }))})
}







const getAllProfileFollowers = async (req, res, next) => {
  userName = req.params.username 
  let user;
  let followers;
  let users;

  try {
    user = await User.findOne({ userName: userName })
  } catch (err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }
  let newArr = [...user.followers]

  try {
    users = await User.find()
  } catch (err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }
  let usersArr = []

  for (let i = 0; i < users.length; i++) {
    usersArr.push(users[i].id)
  }

  let filteredArr = newArr.filter(user => usersArr.includes(user))

  if (user.followers.length === 0) {
    const error = new HttpError('This user is not followed by anyone', 500);
    return next(error)
  }

  try {
    followers = await User.find().where('_id').in(filteredArr).exec() 
  } catch(err) {
    const error = new HttpError('Could not establish the list of followed users', 500)
    return next(error)
  }

  res.json({ users: followers.map(user => user.toObject({ getters: true }))})
}





const getUserById = async (req, res, next) => {
  userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Could not find that user', 500);
    return next(error)
  }

  
  if (!user) {
    return next(new HttpError('Could not find a user for the provided Id.', 404))
  }
  
  const info = {
    following: user.following,
    followers: user.followers,
    posts: user.posts,
    userName: user.userName,
    id: user.id,
    image: user.image,
    saves: user.saves,
    name: user.name,
    activity: user.activity,
    activityNotifications: user.activityNotifications,
    followedHash: user.followedHash,
    convos: user.conversations,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    bio: user.bio,
    webSite: user.webSite
    //this is stupid, please change this to just emit the things you dont need, moron. 

    

  }

  res.json({ user: info});
}

const getUserByUserName = async (req, res, next) => {
  userId = req.params.uid;
  let user;
  try {
    user = await User.findOne({userName: userId})
  } catch (err) {
    const error = new HttpError('Could not find that user', 500);
    return next(error)
  }

  
  if (!user) {
    return next(new HttpError('Could not find a user for the provided Name.', 404))
  }
  
  const info = {
    following: user.following,
    followers: user.followers,
    posts: user.posts,
    userName: user.userName,
    id: user.id,
    image: user.image,
    name: user.name,
    email: user.email,
    convos: user.conversations,
    bio: user.bio

  }

  res.json({ user: info});
}


const createUser = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  
   
      return next(
        new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422)
        ) 
      }
  const {password, userName, email, image, name} = req.body;
  let existingEmail;
  let existingUser;

  try {
    existingEmail = await User.findOne({ email: email })
  } catch(err) {
    const error = newHttpError('Signing up failed. Try again later 1', 500)
    return next(error)
  }

  try {
    existingUser = await User.findOne({ userName: userName })
  } catch (err) {
    const error = new HttpError('Signing up failed. Try again later 2', 500)
    return next(error)
  }

  if (existingUser) {
    const error = new HttpError('User Name already exists', 422)
    return next(error);
  }

  if (existingEmail) {
    const error = new HttpError(' Email is associated with another account already', 422)
    return next(error)
  }

  let hashedPassword; 
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch(err) {
    const error = new HttpError(
      'creashed while creating hashed password', 500
    );
    return next(error)
  }

  
  const createdUser = new User({
    email,
    userName,
    password: hashedPassword,
    following: [],
    followers: [],
    posts: [],
    saves: [],
    conversations: [],
    activity: [],
    image,
    name,
    webSite: "",
    bio: "",
    phone: "",
    gender: "",
    activityNotifications: 0

  })

try {
  await createdUser.save();
} catch (err) {
  const error = new HttpError('Creating user failed 1 ', 500)
  return next(error)
}

let token;
try {
  token = jwt.sign(
    {userId: createdUser.id, email: createdUser.email},
     process.env.JWT_KEY,
      {expiresIn: '1h'})
    } catch (err) {
      const error = new HttpError('Creating user failed 2 ', 500)
      return next(error)
    }


res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token, userName: createdUser.userName});

}



const updateUser = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  
  
      return next(new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422))
    }

  const { image, website, bio, phone, gender, activity, followedHash, email, name, username, newPublicId, activityNotifications } = req.body;
  const userId = req.params.uid;
  let user;
 

  try {
    user = await User.findById(userId)
  } catch(err) {
    const error = new HttpError('Something went wrong, could not find this user', 500)
    return next(error);
  }

  if (username) {user.userName = username}
  if (name) {user.name = name}
  if (gender) {user.gender = gender}
  if (phone) { user.phone = phone}
  if (bio) {user.bio = bio}
  if (website) {user.webSite = website}
  if (image) {user.image = image}
  if (email) {user.email = email}
  if (activity) {user.activity = activity}
  if (followedHash) {user.followedHash = followedHash} // purely for postman purposes
  if (activityNotifications) {user.activityNotifications = 0}


  if (image) {
    try {
      cloudinary.uploader.add_tag(userId, newPublicId, function(error,result) {
       });
   
    } catch(err) {
     const error = new HttpError('Cloudinary hates you', 500)
     return next(error)
   
    }
  }


  try {
    await user.save();
  } catch(err) {
    const error = new HttpError('Could not update user', 500)
    return next(error);
  }
  res.status(200).json({activityNotifications: activityNotifications, user: user.toObject({ getters: true })})
}



const updateUserSaves  = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  
  
      return next (new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422))
    }

    const userId = req.params.uid;
    const { postId} = req.body
    let user;
    let post;

    try {
      post = await Post.findById(postId)
    } catch (err) {
      const error = new HttpError(`Something went wrong ${postId}`, 500 )
      return next(error)
    }

  try {
    user = await User.findById(userId)
  } catch(err) {
    const error = new HttpError('could not find user with that id', 500)
    return next(error);
  }


  if (!post) {
    return next( new HttpError('This post does not exist', 500))
  }

  if (user.saves.includes(post.id)) {
    user.saves = user.saves.filter(p => p !== post.id)
  } else {
    user.saves.push(post.id)
  }

  try {
    user.save()
  } catch (err) {
    const error = new HttpError('could not update this list of followed users', 500)
    return next(error)
  }
  res.status(200).json({message: 'Saves Adjusted'})
}



const updateUserHash = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  
    
      return next (new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422))
    }
  const userId = req.params.uid
  const { hashTag } = req.body
  let user;

  try {
    user = await User.findById(userId)
  } catch(err) {
    const error = new HttpError('could not find user with that id', 500)
    return next(error);
  }

  if (user.followedHash.includes(hashTag)) {
    user.followedHash = user.followedHash.filter(u => u !== hashTag)
  } else {
    user.followedHash = [...user.followedHash, hashTag]
  }
  
  try {
    user.save()
  } catch (err) {
    const error = new HttpError('could not update this list of followed users', 500)
    return next(error)
  }
  res.status(200).json({user: user.toObject({ getters: true })})

}



const updateUserFollowing = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  
  
      return next (new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422))
    }

  const {otherUser} = req.body;
  const userId = req.params.uid;
  let user;
  let existingUser;

  const today = new Date()
  const month = today.getMonth() + 1
  const codeTime = today.getTime()

  try {
    user = await User.findById(userId)
  } catch(err) {
    const error = new HttpError('could not find user with that id', 500)
    return next(error);
  }

  try {
    existingUser = await User.findById(otherUser)
  } catch(err) {
    const error = new HttpError('You cannot follow a user that does not exist', 500)
    return next(error);
  }

  if (!existingUser) {
    return next( new HttpError('This user does not exist', 500))
  }

  if (user.following.includes(existingUser.id)) {
    user.following = user.following.filter(u => u !== existingUser.id)
    existingUser.followers = existingUser.followers.filter(u => u !== user.id)
  } else {
    user.following.push(existingUser.id)
    existingUser.activity = [...existingUser.activity, {type: "follow", user: user.id, userName: user.userName, date: {fullDate: today, month: month, time:codeTime} }]
    existingUser.activityNotifications = existingUser.activityNotifications + 1
    existingUser.followers.push(user.id)
  }

  try {
    user.save()
  } catch (err) {
    const error = new HttpError('could not update this list of followed users', 500)
    return next(error)
  }

  try {
    existingUser.save()
  } catch (err) {
    const error = new HttpError('could not update the list of followers', 500)
    return next(error)
  }


    res.status(200).json({user: user.toObject({ getters: true })})
  }



  const clearActivity = async (req, res, next) => {
    const userId = req.params.uid
    let user;

    try {
      user = await User.findById(userId)
    } catch(err) {
      const error = new HttpError('could not find user with that id', 500)
      return next(error);
    }
    user.activity = []

    try {
      user.save()
    } catch (err) {
      const error = new HttpError('could not clear this user activity', 500)
      return next(error)
    }

    res.status(200).json({message: 'activity cleared'})
  }





const deleteUser =  async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  let posts;



  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Could not find this user', 500)
    return next(error)
  }

  try {
    posts = await Post.find()
  } catch (err) {
    const error = new HttpError('Could not find these posts', 500)
    return next(error)
  }

  userPosts = posts.filter(post => post.id === userId)

  try {
    cloudinary.api.delete_resources_by_tag(userId, function(error,result) {
      });

  } catch (err) {
    const error = new HttpError(
      'cloudinary hates you', 404
    )
    return next (error)
  }

  try {
    await Post.deleteMany({user: userId})
  } catch (err) {
    const error = new HttpError('error deleting user posts', 500)
    return next(error)
  }

  // delete convos this way? ^

  try {
    await user.remove()
  } catch (err) {
    const error = new HttpError(' Could not delete this user', 500)
    return next(error)
  }
  
  

  res.status(200).json({message: 'userDeleted'})
}








const login = async (req, res, next) => { // rember logging in is for a token that will get sent to the browser
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  
  
      return next( new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422))
    }
  const {email, password} = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email }) //validating email
  } catch(err) {
    const error = new HttpError(
      'logging in failed, please try again ', 500
    )
    return next(error)
  }

  if (!existingUser) {
    const error = new HttpError('Invalid Credentials', 401)
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password)
  } catch(err) {
    const error = new HttpError(
      'Could not log you in, please check credentials and try again.',
      500
    );
    return next(error)
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    )
    return next(error);
  }

  let token;
try {
  token = jwt.sign(
    {userId: existingUser.id, email: existingUser.email},
     process.env.JWT_KEY,
      {expiresIn: '1h'})
    } catch (err) {
      const error = new HttpError('Logging in failed', 500)
      return next(error)
    }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    userName: existingUser.userName,
    image: existingUser.image,
    token: token
  }) 
}


exports.login = login
exports.getAllUsers = getAllUsers;
exports.getPopularUsers = getPopularUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.updateUserFollowing = updateUserFollowing;
exports.deleteUser = deleteUser;
exports.getAllFollowedUsers = getAllFollowedUsers;
exports.getAllFollowing = getAllFollowing
exports.getUserByUserName = getUserByUserName;
exports.updateUserSaves = updateUserSaves;
exports.getAllSaved = getAllSaved;
exports.getAllProfileFollowing = getAllProfileFollowing;
exports.getAllProfileFollowers = getAllProfileFollowers;
exports.clearActivity = clearActivity;
exports.updateUserHash = updateUserHash;