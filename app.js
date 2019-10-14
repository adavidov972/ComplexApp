const express = require ('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const markdown = require('marked')
const flash = require('connect-flash')
const app = express()


let sessionOptions = session({
    secret : 'mySecretApp',
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000*60*60*24*365, httpOnly: true}
})

app.use(sessionOptions)
app.use(flash())

const router = require('./router')

app.set('views', 'views')
app.set ('view engine', 'ejs')

app.use(function(req,res,next) {

    //Make markeddown functoon avalable in all requests

    res.locals.filterUserHTML = function(content) {
        return markdown(content)
    }
    
    //make user session data avalable within view template
        
    if (req.session.user) {req.visitorId = req.session.user._id} else {req.visitorId = 0}

    //make all slash messages avalable from all templates

    res.locals.errors = req.flash('errors')
    res.locals.success = req.flash('success')

    res.locals.user = req.session.user
    
    next()
})
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use (express.static ('public'))
app.use('/', router)



module.exports = app
