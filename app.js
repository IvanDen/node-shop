const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoBDStore = require('connect-mongodb-session')(session)
const csurf = require('csurf')
const flash = require('connect-flash')

const errorController = require('./controllers/error')
const User = require('./models/user')

require('dotenv').config()

const app = express()
const store = new MongoBDStore({
    uri: process.env.MONGO_DB_CONNECTION_STRING,
    collection: 'sessions'
})

const csrfProtection = csurf()

app.set('view engine', 'ejs')
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store
    })
)
app.use(csrfProtection)
app.use(flash())

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use((req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next()
            }
            req.user = user
            next()
        })
        .catch(err => {
            next(new Error(err))
        })
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.use('/500', errorController.get500)
app.use(errorController.get404)
app.use((error, req, res, next) => {
    // res.redirect('/500')
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    })
})

mongoose
    .set('strictQuery', false)
    .connect(process.env.MONGO_DB_CONNECTION_STRING)
    .then(res => {
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    })
