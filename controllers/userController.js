const User = require('../models/User')
const Post = require('../models/Post')
const Follow = require('../models/Follow')



exports.checkLogin = function(req,res,next) {
  if (req.session.user) {    
    next()
  }else {
    req.flash('errors', 'You must be logged in to preform that action')
    req.session.save( () => res.redirect('/'))
  }
}

exports.login = (req, res) => {
  
  let user = new User(req.body)

  user.login()

    .then( (result) => {
  
      req.session.user = { username: user.data.username, _id : user.data._id }
      req.session.save(() => res.redirect('/'))
    })
    .catch(function (error) {
      req.flash('errors', error)
      req.session.save(() => res.redirect('/'))
    })
}

exports.logout = (req, res) => {

  req.session.destroy(function () {
    res.redirect('/')
  })
}

exports.register = async (req, res) => {
  
  let user = new User(req.body)  
  user.register()

    .then(() => {
      req.session.user = { username: user.data.username, _id : user.data._id } 
      req.session.save(() => res.redirect('/'))
    })

    .catch((regErrors) => {
      regErrors.forEach(error => {
        req.flash('regErrors', error)
      })
      req.session.save(() => res.redirect('/'))
    })
}

exports.home = (req, res) => {

  if (req.session.user) {
    res.render('home-users', {
    })
  } else {
    res.render('home-guest', {
      regErrors: req.flash('regErrors')
    })
  }
}

exports.ifUserExists = function (req,res,next) {
  User.findByUsername(req.params.username)
  .then((user) => {
    req.profileUser = user
    next()
  })
  .catch(() => {
    res.render('404')
  })
}

exports.profilePostsScreen = function (req,res) {
  
  //get post by id from Model
  
  Post.findByAuthorId (req.profileUser._id)
  .then((posts)=> {        
    res.render('profile', {
      profileUsername : req.profileUser.username,
      posts : posts,
      followers : req.followers,
      followees : req.followees,
      isFollowing : req.isFollowing,
      isVisitorProfile : req.isVisitorProfile})
  })
  .catch (() => {    
    res.render('404')
  })
}

exports.profileFollowersScreen = function (req,res) {
  
  //get all followers for this user

  Follow.findFollowers (req.profileUser._id)
  .then((followers)=> {        
    res.render('profile-followers', {
      profileUsername : req.profileUser.username,
      posts : posts,
      followers : req.followers,
      followees : req.followees,
      isFollowing : req.isFollowing,
      isVisitorProfile : req.isVisitorProfile})
  })
  .catch (() => {
    res.render('404')
  })
}
exports.profileFollowingScreen = function (req,res) {
  
  //get all accounts this user is following

  Follow.findFollowing (req.profileUser._id)
  .then((followees)=> {    
    
    res.render('profile-followees', {      
      profileUsername : req.profileUser.username,
      posts : posts,
      followers : req.followers,
      followees : followees,
      isFollowing : req.isFollowing,
      isVisitorProfile : req.isVisitorProfile})
  })
  .catch (() => {
    res.render('404')
  })
}

exports.sharedProfileData = async (req,res,next) => {

  let isFollowing = false
  let isVisitorProfile = false
  if (req.session.user) {
      isVisitorProfile = req.profileUser._id.equals(req.session.user._id)
      isFollowing = await Follow.checkIfFollowing(req.params.username, req.visitorId)
      req.isVisitorProfile = isVisitorProfile
      req.isFollowing = isFollowing
      next()
  }
}