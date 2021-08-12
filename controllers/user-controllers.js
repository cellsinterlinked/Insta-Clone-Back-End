const HttpError = require('../models/http-error');
const User = require('../models/user');
const Post = require('../models/post')
const { validationResult } = require('express-validator')



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

  popularUsers = users.filter(p => p.id !== user.id  && !user.following.includes(p.id))

  // arrange this by how many followers (the most on top)

  res.json({ users: popularUsers.map(user => user.toObject({ getters: true }))})
}


const getAllFollowedUsers = async (req, res, next) => {
  userId = req.params.uid
  let user;
  let followedUsers;

  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }
  let newArr = [...user.following]
  //now that we have the user data we can tap into user.following which is an array of all the id's of the users they follow;

  if (user.following.length === 0) {
    const error = new HttpError('This user is not following anyone', 500);
    return next(error)
  }

  try {
    followedUsers = await User.find().where('_id').in(newArr).exec() 
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

  try {
    user = await User.findOne({ userName: userName})
  } catch (err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }
  let newArr = [...user.following]
  //now that we have the user data we can tap into user.following which is an array of all the id's of the users they follow;

  if (user.following.length === 0) {
    const error = new HttpError('This user is not following anyone', 500);
    return next(error)
  }

  try {
    followedUsers = await User.find().where('_id').in(newArr).exec() 
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
  try {
    user = await User.findById(userId)
  } catch (err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error);
  }
  let newArr = [...user.saves]

  if (user.saves.length === 0) {
    const error = new HttpError('This user has no saves', 500);
    return next(error)
  }

  try {
     saves = await Post.find().where('_id').in(newArr).exec() 
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
    followers = await User.find().where('_id').in(newArr).exec() 
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

  try {
    user = await User.findOne({ userName: userName })
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
    followers = await User.find().where('_id').in(newArr).exec() 
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
    activity: user.activity
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
    

  }

  res.json({ user: info});
}


const createUser = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  // if there are errors 
      console.log(errors);
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
  
  const createdUser = new User({
    email,
    userName,
    password,
    following: [],
    followers: [],
    posts: [],
    saves: [],
    conversations: [],
    image,
    name,
    webSite: "",
    bio: "",
    phone: "",
    gender: ""

  })

try {
  await createdUser.save();
} catch (err) {
  const error = new HttpError('Creating user failed', 500)
  return next(error)
}

res.status(201).json({user: createdUser.toObject({ getters: true })});

}



const updateUser = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  // if there are errors 
      console.log(errors);
      return next(new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422))
    }

  const { image, webSite, bio, phone, gender, activity } = req.body;
  const userId = req.params.uid;
  let user;

  try {
    user = await User.findById(userId)
  } catch(err) {
    const error = new HttpError('Something went wrong, could not find this user', 500)
    return next(error);
  }
  if (gender) {user.gender = gender}
  if (phone) { user.phone = phone}
  if (bio) {user.bio = bio}
  if (webSite) {user.webSite = webSite}
  if (image) {user.image = image}
  if (activity) {user.activity = activity}

  try {
    await user.save();
  } catch(err) {
    const error = new HttpError('Could not update user', 500)
    return next(error);
  }
  res.status(200).json({user: user.toObject({ getters: true })})
}



const updateUserSaves  = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  // if there are errors 
      console.log(errors);
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







const updateUserFollowing = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  // if there are errors 
      console.log(errors);
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
    existingUser.activity = [...user.activity, {type: "follow", user: user.id, userName: user.userName, date: {fullDate: today, month: month, time:codeTime} }]
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





const deleteUser = (req, res, next) => {
  const userId = req.params.uid;

  if (!DUMMY_USERS.find(u => u.userId === userId)) {                    // if the user doesn't exist
    throw new HttpError('Could not find user for that id', 404)
  }

  DUMMY_USERS = DUMMY_USERS.filter(u => u.id !== userId);

  res.status(200).json({message: 'userDeleted'})
}



const login = async (req, res, next) => { // rember logging in is for a token that will get sent to the browser
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  // if there are errors 
      console.log(errors);
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

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError('Invalid Credentials', 401)
    return next(error);
  }
  res.json({message: 'Logged In!'}) //this will eventually send back a token.  
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