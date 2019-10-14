const Follow = require('../models/Follow')

exports.addFollow = (req,res) => {
    
    let follow = new Follow(req.params.username, req.visitorId)
    follow.create()
    .then(() => {
        req.flash('success', 'Successfully followed')
        req.session.save(()=> res.redirect (`/profile/${req.params.username}`))
    })
    .catch((errors) => {
        errors.forEach(error => {
            req.flash('errors', error)
        })
        req.session.save(() => res.redirect('/'))
    })
}

exports.removeFollow = (req,res) => {    
    let follow = new Follow(req.params.username, req.visitorId)
    follow.remove()
    .then(() => {
        req.flash('success', 'Follow Successfully removed')
        req.session.save(()=> res.redirect (`/profile/${req.params.username}`))
    })
    .catch((errors) => {
        errors.forEach(error => {
            req.flash('errors', error)
        })
        req.session.save(() => res.redirect('/'))
    })
}