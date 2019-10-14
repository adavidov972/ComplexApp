const usersCollection = require('../db').db().collection('users')
const followsCollection = require('../db').db().collection('follows')
const ObjectID = require('mongodb').ObjectID



let Follow = function (followedUsername, authorId) {
    console.log(followedUsername, authorId)
    
    this.followedUsername = followedUsername
    this.authorId = authorId
    this.errors = []
}

Follow.prototype.cleanUp = function () {

    if (typeof (this.followedUsername) != "string") {
        this.followedUsername = ""
    }
}

Follow.prototype.validate = async function (action) {
    //followed username must be exist in the databse    
    let followAccount = await usersCollection.findOne({
        username: this.followedUsername
    })
    if (followAccount) {
        this.followedID = followAccount._id
    } else {
        this.errors.push = 'You can not follow accounr that is not exist'
    }

    let doesFollowAlreadyExist = await followsCollection.findOne({
        followedID: this.followedID,
        authorId: new ObjectID(this.authorId)
    })
    if (action == 'create') {
        if (doesFollowAlreadyExist) {
            this.errors.push('You are already foolowing this user')
        }
    }

    if (action == 'delete') {
        if (!doesFollowAlreadyExist) {
            this.errors.push('You are not foolowing this user.')
        }
    }

    //Should not be able to follow ypur self

    if (this.followedID.equals(this.authorId)) {
        this.errors.push('You can not follow yourself.')
    }
}

Follow.prototype.create = function () {

    return new Promise(async (resolve, reject) => {

        this.cleanUp()
        await this.validate('create')
        if (!this.errors.length) {
            await followsCollection.insertOne({
                followedID: this.followedID,
                authorId: new ObjectID(this.authorId)
            })
            resolve()
        } else {
            reject(this.errors)
        }
    })
}

Follow.prototype.remove = function () {

    return new Promise(async (resolve, reject) => {

        this.cleanUp()
        await this.validate('delete')
        if (!this.errors.length) {
            await followsCollection.deleteOne({
                followedID: this.followedID,
                authorId: new ObjectID(this.authorId)
            })
            resolve()
        } else {
            reject(this.errors)
        }
    })
}

Follow.checkIfFollowing = async (followedUsername, followerId) => {

    let followedDoc = await usersCollection.findOne({
        username: followedUsername
    })
    if (followedDoc) {
        let isFollowing = await followsCollection.findOne({
            followedID: followedDoc._id,
            authorId: new ObjectID(followerId)
        })
        if (isFollowing) {
            return true
        } else {
            return false
        }
    }
}

Follow.findFollowers = function (profileID) {
    return new Promise(async (resolve, reject) => {

        if (!ObjectID.isValid(profileID)) {
            reject()
            return
        }
        try {
            let followers = await followsCollection.aggregate ([
                {$match : {followedID: new ObjectID(profileID)}},
                {$lookup : {from : 'users', localField : 'authorId', foreignField : '_id', as : 'userDoc'}},
                //{$project: {username : {$arrayElemAt: ["$userDoc.username", 0]}}}
            ]).toArray()
            console.log(followers);
            followers = followers.map((follower) => {

                
            })
            if (followers) {
                resolve(followers)
            } else {
                resolve([])
            }
        }catch {
            reject()
        }
    })
}

Follow.findFollowing = function (profileID) {

    return new Promise(async (resolve, reject) => {
        if (typeof (profileID) != "string" || !ObjectID.isValid(id)) {
            reject()
            return
        }
        let followees = await followsCollection.find(
            {$match : {authorId: new ObjectID(profileID)}}
        ).toArray()
        //console.log(followees);
        
        if (followees) {
            resolve(followees)
        } else {
            resolve([])
        }
    })
}


module.exports = Follow