
const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const followController = require('./controllers/followController')


// User related routes

router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

//Posts related routes

router.get('/create-post', userController.checkLogin, postController.viewCreateScreen)
router.post('/create-post', userController.checkLogin, postController.create)
router.get('/post/:id', postController.viewSingle)
router.get('/post/:id/edit', userController.checkLogin, postController.viewEditScreen)
router.post('/post/:id/edit', userController.checkLogin, postController.editPost)
router.post('/post/:id/delete', userController.checkLogin, postController.deletePost)
router.post('/search', userController.checkLogin, postController.search)

//Profile related routes

router.get('/profile/:username', userController.ifUserExists, userController.sharedProfileData, userController.profilePostsScreen)
router.get('/profile/:username/followers', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowersScreen)
router.get('/profile/:username/following', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowingScreen)

//Follow related routes

router.post('/addFollow/:username',userController.checkLogin, followController.addFollow)
router.post('/removeFollow/:username',userController.checkLogin, followController.removeFollow)



module.exports = router
