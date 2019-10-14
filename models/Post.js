const postsCollection = require('../db').db().collection('posts')
const ObjectId = require('mongodb').ObjectID
const sanitizeHTML = require('sanitize-html')

let Post = function (data, userId, requestedPostId) {
    this.data = data
    this.errors = []
    this.userId = userId
    this.requestedPostId = requestedPostId
}

Post.prototype.cleanUp = function () {

    if (typeof (this.data.title) != 'string') {
        this.data.title = ""
    }
    if (typeof (this.data.body) != 'string') {
        this.data.body = ""
    }

    // get rid of any bogus propeties

    this.data = {
        title: sanitizeHTML(this.data.title.trim(), {
            allowTags: [],
            allowedAttributes: []
        }),
        body: sanitizeHTML(this.data.body.trim(), {
            allowTags: [],
            allowedAttributes: []
        }),
        createdAt: new Date(),
        author: ObjectId(this.userId)
    }

}

Post.prototype.validate = function () {
    if (this.data.title == "") {
        this.errors.push('You nust provide title content')
    }
    if (this.data.body == "") {
        this.errors.push('You nust provide body content')
    }
}

Post.prototype.create = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (!this.errors.length) {
            postsCollection.insertOne(this.data)
                .then(() => {
                    resolve()
                })
                .catch(() => {
                    this.errors.push('Please try again later')
                    reject(this.errors)

                })
            resolve()
            //Save post the database
        } else {
            reject(this.errors)
        }
    })
}

Post.prototype.update = function () {

    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(this.requestedPostId, this.userId)
            if (post.isVisitorOwner) {
                let status = await this.acuallyUpdate()
                resolve(status)
            } else {
                reject()
            }
        } catch {
            reject()
        }
    })
}

Post.prototype.acuallyUpdate = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (!this.errors.length) {
            await postsCollection.findOneAndUpdate({
                _id: new ObjectId(this.requestedPostId)
            }, {
                $set: {
                    title: this.data.title,
                    body: this.data.body
                }
            })
            resolve('success')
        } else {
            resolve('failure')
        }
    })
}

Post.reusablePostQuery = function (uniqueOperations, visitorId) {

    return new Promise(async function (resolve, reject) {
        let aggOperations = uniqueOperations.concat([{
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "authorDocument"
                }
            },
            {$project: {
                    title: 1,
                    body: 1,
                    createdAt: 1,
                    authorId: "$author",
                    author: {
                        $arrayElemAt: ["$authorDocument", 0]
                    }
                }
            }
        ])
        let posts = await postsCollection.aggregate(aggOperations).toArray()

        //clean up author property in each post object

        posts.map(function (post) {
            post.isVisitorOwner = post.authorId.equals(visitorId)
            post.author = {
                username: post.author.username
            }
            post.authorId = undefined
            return post
        })
        resolve(posts)
    })
}

Post.findSingleById = function (id, visitorId) {
    return new Promise(async function (resolve, reject) {
        if (typeof (id) != "string" || !ObjectId.isValid(id)) {
            reject()
            return
        }
        let posts = await Post.reusablePostQuery([{
            $match: {
                _id: new ObjectId(id)
            }
        }], visitorId)
        if (posts.length) {
            resolve(posts[0])
        } else {
            reject()
        }
    })
}

Post.findByAuthorId = function (authorId) {
    return Post.reusablePostQuery([
        {$match: {author: authorId}},
        {$sort: {createdAt: -1}}
    ])
}

Post.delete = function (postIdToDelete, currentUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(postIdToDelete, currentUserId)
            if (post.isVisitorOwner) {
                await postsCollection.deleteOne({
                    _id: new ObjectId(postIdToDelete)
                })
                resolve()
            } else {
                reject()
            }
        } catch {
            reject()
        }
    })
}

Post.search = function (searchTerm) {            
    return new Promise (async (resolve,reject) => {
        if (typeof(searchTerm)== "string") {
            
            let posts = await Post.reusablePostQuery([
                {$match : {$text : {$search : searchTerm}}},
                {$sort : {score : {$meta : "textScore"}}}
            ])            
            resolve(posts)
        } else {
            reject()
        }
    })
}

module.exports = Post