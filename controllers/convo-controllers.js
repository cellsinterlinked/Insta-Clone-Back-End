const HttpError = require('../models/http-error');
const { validationResult} = require('express-validator')
const Post = require('../models/post')
const User = require('../models/user');
const Convo = require('../models/convo');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const mongooseUniqueValidator = require('mongoose-unique-validator');
const user = require('../models/user');
const post = require('../models/post');

const createConvo = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  // if there are errors 
      console.log(errors);
      return next(
        new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422)
        ) 
    }

  const { user1, user2, message, image, } =  req.body
  
  const monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  const year = today.getFullYear()
  const codeTime = today.getTime()
  const stringMonth = monthArray[month - 1]

  const createdConvo = new Convo({
  messages: [{message: message, date: {fullDate: today, month: month, day: day, year: year, time:codeTime, monthString: stringMonth}, image: image, user: user1}],
  users: [user1, user2]
 })

 let firstUser
 let secondUser

 try {
   firstUser = await User.findById(user1);
 } catch (err) {
   const error = newHttpError('Something went wrong', 500)
   return next(error);
 }

 if (!firstUser) {
   const error = new HttpError('Could not find a  user for the provided ID', 500)
   return next(error)
 }

 try {
  secondUser = await User.findById(user2);
} catch (err) {
  const error = newHttpError('Something went wrong', 500)
  return next(error);
}

if (!secondUser) {
  const error = new HttpError('Could not find a  user for the provided ID', 500)
  return next(error);
}

try {
  const sess = await mongoose.startSession();
  sess.startTransaction();
  await createdConvo.save({ session: sess })
  firstUser.conversations.push(createdConvo);
  secondUser.conversations.push(createdConvo);
  await firstUser.save({ session: sess })
  await secondUser.save({ session: sess })
  await sess.commitTransaction();
} catch (err) {
  const error = new HttpError(
    'Creating conversation failed when trying to add to MongoDB.', 500
  )
  return next(error)
}
res.status(201).json({ convo: createdConvo.toObject({ getters: true})})

 
 //separeate try blocks to find user 1 and user 2. then in the session user.convo.push(createdConvo) 
 //if there is an "image" in the message object front end will display the image in message component.
}


const sendMessage = async (req, res, next) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {  // if there are errors 
      console.log(errors);
      return next(
        new HttpError('Invalid inputs passed. Make sure all inputs have been filled out.', 422)
        ) 
    }
    
  const { message, user, image } = req.body;
  const convoId = req.params.cid;
    
  let convo;
  

  const monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  const year = today.getFullYear()
  const codeTime = today.getTime()
  const stringMonth = monthArray[month - 1]

  try {
    convo = await Convo.findById(convoId)
  } catch(err) {
    const error = new HttpError('Something went wrong, cant find this convo', 500)
    return next(error);
  }

  convo.messages = [...convo.messages, {message: message, user: user, date: {fullDate: today, month: month, day: day, year: year, time:codeTime, monthString: stringMonth}, image:image, }]

  try {
    await convo.save();
  } catch(err) {
    const error = new HttpError('sending this message did not work.', 500)
    return next(error)
  }

  res.status(200).json({convo: convo.toObject({ getters: true})})
}




const deleteConvo = async (req,res, next) => {
  const convoId = req.params.cid;
  // also add logic to make it unable to delete convo unless you are the owner
  let convo;
  let user1;
  let user2;

  try {
    convo = await Convo.findById(convoId).populate('users')
  } catch (err) {
    const error = new HttpError('couldnt populate the users', 500)
    return next(error)
  }

  console.log(convo)
  console.log(convo.users)

  if (!convo) {
    const error = new HttpError('Could not find a convo for this ID', 404)
    return next(error);
  }

  user1 = convo.users[0];
  user2 = convo.users[1];

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await convo.remove({ session: sess })
   
    user1.conversations.pull(convo);
    user2.conversations.pull(convo);
    await user1.save({ session: sess})
    await user2.save({ session: sess})
    await sess.commitTransaction()
  } catch(err) {
    const error = new HttpError(' Could not delete this convo', 500)
    return next(error)
  }
  res.status(200).json({ message: 'convo deleted'})
}



const getConvoById = async (req, res, next) => {
  const convoId = req.params.cid;

  let convo;
  
  try {
    convo = await Convo.findById(convoId)
  } catch(err) {
    const error = new HttpError('Something went wrong', 500 )
    return next(error)
  }

  if (!convo) {
    const error =  new HttpError('Could not find a convo for the provided id.', 404);
    return next(error)
  }

  res.json({ convo: convo.toObject( { getters: true })})
}



const getConvosByUser = async (req, res, next) => {
  const userId = req.params.uid 

  let convos;

  try {
    convos = await Convo.find();
  } catch(err) {
    const error = new HttpError('Something went wrong', 500)
    return next(error)
  }

  let newConvos = convos.filter(convo => convo.users.includes(userId))

  if (newConvos.length === 0 || !newConvos) {
    return new HttpError('no conversations with this user tagged', 500)
  }

  res.json({ convos: newConvos.map(convo => convo.toObject({ getters: true }))})
}

exports.getConvoById = getConvoById
exports.getConvosByUser = getConvosByUser
exports.createConvo = createConvo
exports.deleteConvo = deleteConvo
exports.sendMessage = sendMessage