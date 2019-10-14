
const usersCollection = require('../db').db().collection('users')
const validator = require('validator')
const bcrypt = require('bcryptjs')

let User = function (data) {
  this.data = data
  this.errors = []
}

User.prototype.cleanUp = function() {
  if (typeof(this.data.username) != "string") { this.data.username = "" }
  if (typeof(this.data.email) != "string") { this.data.email = "" }
  if (typeof(this.data.password) != "string") { this.data.password = "" }

  //get rid of any bogus properties

  this.data = {
    username : this.data.username.trim().toLowerCase(),
    email : this.data.email.trim().toLowerCase(),
    password : this.data.password.trim()
  }
}

User.prototype.validate = async function () {

  return new Promise (async (resolve,reject) => {
    if (this.data.username == "" || !validator.isAlphanumeric(this.data.username)) { this.errors.push ("Please enter valid username without any numbers or symbols") }
    if (!validator.isEmail(this.data.email)) { this.errors.push ("Please enter email") }
    if (this.data.password == "") { this.errors.push ("Please enter password") }
    if (this.data.password.length > 50) { this.errors.push ("Password can not be more than 100 charectors") }
    if (this.data.password.length > 0 && this.data.password.length < 8) { this.errors.push ("Password must be 8 charectors minimum") }
    if (this.data.username.length > 50) { this.errors.push ("Username can not be more than 50 charectors") }
  
    //Check if username is already taken in server
  
    if (this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
      let user = await usersCollection.findOne({username : this.data.username})
      if (user) {this.errors.push('Username is already taken')}
    }
  
    if (validator.isEmail(this.data.email)) {
      let email = await usersCollection.findOne({email : this.data.email})
      if (email) {this.errors.push('Email is already being used')}
    }
    resolve()
  })
}

User.prototype.login = function () {
  
  return new Promise((resolve,reject) => {
    
    this.cleanUp()

  usersCollection.findOne({username : this.data.username})
    .then((user) => {
      if (user && bcrypt.compareSync(this.data.password, user.password)) {
        resolve('Login success')
      }else {
        reject('Invalid username or password')
      }
    })
    .catch(() => {
      reject('Can not connect to the server. Please try again later')
    })
  })
}

User.prototype.register = function() {

  return new Promise (async (resolve, reject) => {

    this.cleanUp()
    await this.validate()
  
    if (!this.errors.length) {
      //Hash the password
        let salt = bcrypt.genSaltSync(10)
        this.data.password = bcrypt.hashSync(this.data.password, salt)
        console.log('register func');        
        
        await usersCollection.insertOne(this.data)
        resolve()
    } else {
        reject(this.errors)
    }
  })
}

User.findByUsername = function (username) {

  return new Promise ((resolve,reject) => {
    if (typeof(username) != "string") {
      reject()
      return
    }
    usersCollection.findOne({username : username})
    .then((userDoc) => {
      if(userDoc) {        
        userDoc = new User(userDoc)
        userDoc = {
          _id : userDoc.data._id,
          username : userDoc.data.username,
        }
        resolve(userDoc)
      }else {
        reject()
      }
    })
    .catch (() => {
      reject()
    })
  })
}

module.exports = User
