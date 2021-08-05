const express = require('express')

const userControllers = require('../controllers/user-controllers');

const router = express.Router();

const { check } = require('express-validator')


router.get('/', userControllers.getAllUsers);
///////////////////////////////////////////////////////////////////////////////////

router.get('/saved/:uid', userControllers.getAllSaved);
router.get('/profile/followers/:username', userControllers.getAllProfileFollowers)
router.get('/profile/following/:username', userControllers.getAllProfileFollowing)
//////////////////////////////////////////////////////////////////////////////////

router.get('/profile/:uid', userControllers.getUserByUserName);

router.get('/following/:uid', userControllers.getAllFollowedUsers )

router.get('/followers/:uid', userControllers.getAllFollowing)

router.get('/:uid', userControllers.getUserById);



router.post('/login',
[
  check('email').not().isEmpty(),
  check('password').not().isEmpty(),
  ],
userControllers.login)




router.post('/signup',
[
check('userName').not().isEmpty(),
check('email').not().isEmpty(),
check('password').isLength({min: 6}),
],
userControllers.createUser);


// router.patch('/follower/:uid',
// [
//   check('myId').not().isEmpty()
// ],
// userControllers.updateUserFollowers)


router.patch('/following/:uid',
[
  check('otherUser').not().isEmpty(),
 ],
userControllers.updateUserFollowing);

///////////////////////////////////////////////////////////////
router.patch('/saves/:uid',
[
  check('postId').not().isEmpty()
],
userControllers.updateUserSaves);
////////////////////////////////////////////////////////////////


router.patch('/:uid',
userControllers.updateUser);



router.delete('/:uid', userControllers.deleteUser)


module.exports = router