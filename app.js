const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');
const convoRoutes = require('./routes/convos-routes')
const postRoutes = require('./routes/posts-routes');

const userRoutes = require('./routes/users-routes');

const app = express();

app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  next();
})

app.use('/api/posts', postRoutes)

app.use('/api/users', userRoutes)

app.use('/api/convos', convoRoutes)


app.use((res, req, next) => {   // this is a catch all for unsupported routes if they send a request to a route that isn't listed above ^
  const error = new HttpError('Could not find this route.', 404);
  throw error;
})

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500)
  res.json({message: error.message || 'An unknown error occurred!'})

})

mongoose
  .connect('mongodb+srv://scott:zealot2163@cluster1.zszej.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
  .then(() => {       // if server successfully connected to database, app.listen(5000)
    app.listen(5000);
  })
  .catch(err => {
    console.log(err)
  })                // if server didn't successfully connect to the database
