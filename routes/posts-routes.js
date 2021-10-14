const express = require('express')

const postControllers = require('../controllers/post-controllers')

const router = express.Router(); // gives us configured router to export into appJS

const { check } = require('express-validator')

const checkAuth = require('../middleware/check-auth');


router.get('/', postControllers.getAllPosts)

router.get('/hash/:hash', postControllers.getPostsByHash)

router.get('/hashtags', postControllers.getAllHashTags)

router.get('/tagged/:uid', postControllers.getTaggedPosts);

router.get('/taggeduser/:uid', postControllers.getTaggedPostsById)

router.get('/followed/:uid', postControllers.getFollowedPosts)

router.get('/profile/:uid', postControllers.getPostsByUserName);

router.get('/user/:uid', postControllers.getPostsByUser)

router.get('/:pid', postControllers.getPostById)



router.use(checkAuth)

router.post('/', 
[
  check('image').not().isEmpty(),
  check('description').isLength({min: 5})
],
 postControllers.createPost )   // my middleware that goes in order ^


router.patch('/:pid', 
[
  check('image').not().isEmpty(),
  check('description').isLength({min: 5})
],
postControllers.updatePost)


router.patch('/comments/:pid',
[
check('commentor').not().isEmpty(),
check('comment').not().isEmpty(),

],
postControllers.updatePostComments)


router.patch('/likes/:pid',
[
  check('user').not().isEmpty()
],
postControllers.updatePostLikes)


router.delete('/:pid', postControllers.deletePost)


router.patch('/comment-delete/:cid',
[
check('postId').not().isEmpty()
],
postControllers.deleteComment)


module.exports = router //the thing we are exporting is this router constant 