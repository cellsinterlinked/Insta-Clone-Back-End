const express = require('express')
const convoControllers = require('../controllers/convo-controllers');
const router = express.Router();

const { check } = require('express-validator')


router.get('/messages/:uid', convoControllers.getConvosByUser);

router.get('/notifications/:uid', convoControllers.getConvoNotifications)

router.get('/:cid', convoControllers.getConvoById)



router.patch('/:cid',
[
check('user').not().isEmpty(),
],
convoControllers.sendMessage)



router.patch('/reset/:cid',
[
check('user').not().isEmpty(),
],
convoControllers.resetNotifications)



router.post('/', 
[
check('user1').not().isEmpty(),
check('user2').not().isEmpty(),
check('message').not().isEmpty()
],
convoControllers.createConvo)




router.delete('/:cid', convoControllers.deleteConvo)

module.exports = router