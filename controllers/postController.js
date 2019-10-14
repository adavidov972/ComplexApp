const Post = require('../models/Post')


exports.viewCreateScreen = function (req, res) {
    res.render('create-post')
}

exports.create = function (req, res) {
    let post = new Post(req.body, req.session.user._id)
    post.create()
        .then(() => {
            req.flash('success', 'Post successfully created')
            req.session.save(() => res.redirect(`/profile/${req.session.user.username}`))
        })
        .catch((errors) => {
            res.send(errors)
        })
}

exports.viewSingle = async function (req, res) {
    try {
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        res.render('post-single', {
            post: post
        })

    } catch {
        res.render('404')
    }
}

exports.viewEditScreen = async function (req, res) {
    try {       
        console.log('try');
                               
            let post = await Post.findSingleById(req.params.id)
            if (post.authorId == req.visitorId) {  
            res.render('edit-post', {
                post: post
            })
        } else {
            req.flash('errors', "You dont have permission to perform that action")
            req.session.save(() => res.redirect('/'))
        }
    } catch (e){                
        res.render('404')
    }
}


exports.editPost = function (req, res) {

    let post = new Post(req.body, req.visitorId, req.params.id)
    post.update()
        .then((status) => {

            //the post successfully updated
            //or user did not have permissions
            if (status == 'success') {
                req.flash('success', 'Post successfully updated')
                req.session.save(() => res.redirect(`/profile/${req.session.user.username}`))
            } else {
                post.errors.forEach((error) => {
                    req.flash('errors', error)
                })
                req.session.save(() => res.redirect(`/post/${req.params.id}/edit`))
            }

        })
        .catch(() => {
            //a post with the id doesn't exist or the requester is not the owner
            //redirect the the root page

            req.flash('errors', 'Error, you do not have permissions the perform that action')
            req.session.save(() => res.redirect('/'))
        })
}

exports.deletePost = function (req,res) {

    Post.delete(req.params.id, req.visitorId)
    
    .then(() => {                
        req.flash('success', 'Post successfully deleted')
        req.session.save(() => res.redirect(`/profile/${req.session.user.username}`))
    })
    .catch(() => {
        req.flash('errors', "you don't have permmision to perform this action")
        req.session.save(() => res.redirect(`/profile/${req.session.user.username}`))
    })
}

exports.search = function (req,res) {

    Post.search(req.body.searchTerm)
    .then((posts) => res.json(posts))
    .catch(() => res.json([]))
}