const bcryptjs = require('bcryptjs')
const User = require('../models/user')
const sgMail = require('@sendgrid/mail')
const crypto = require('node:crypto')
const { validationResult } = require('express-validator')
require('dotenv').config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.getLogin = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
        oldInput: { email: '', password: '' },
        validationErrors: []
    })
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: { email: '', password: '', confirmPassword: '' },
        validationErrors: []
    })
}

exports.postLogin = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMessage: errors.array()[0].msg,
                oldInput: { email, password },
                validationErrors: errors.array()
            })
    }
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(422)
                .render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'User is not found.',
                    oldInput: { email, password },
                    validationErrors: []
                })
        }
        const compareResult = await bcryptjs.compare(password, user.password)
        if (compareResult) {
            req.session.isLoggedIn = true
            req.session.user = user
            return req
                .session
                .save((err) => {
                    console.log(err)
                    res.redirect('/')
                })
        } else {
            return res.status(422)
                .render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password.',
                    oldInput: { email, password },
                    validationErrors: []
                })
        }
    } catch (err) {
        req.flash('error', 'Invalid email or password.')
        console.log(err)
        return res.status(422)
            .render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMessage: 'Invalid email or password.',
                oldInput: { email, password },
                validationErrors: []
            })
    }
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    // const confirmPassword = req.body.confirmPassword
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log('postSignup has errors: ', errors.array())
        return res
            .status(422)
            .render('auth/signup', {
                path: '/signup',
                pageTitle: 'Signup',
                errorMessage: errors.array()[0].msg,
                oldInput: { email, password, confirmPassword: req.body.confirmPassword },
                validationErrors: errors.array()
            })
    }
    bcryptjs
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                password: hashedPassword,
                cart: {
                    items: []
                }
            })
            return user.save()
        })
        .then(result => {
            res.redirect('/login')
            return sgMail.send({
                to: email,
                from: 'xexete4658@etondy.com',
                subject: 'Authorisation information',
                html: '<h1>You successfully signed up!</h1>'
            })
                .then((response) => {
                    console.log('sendgrig statusCode = ', response[0].statusCode)
                    console.log('sendgrig headers = ', response[0].headers)
                })
        })
        .catch(err => console.log('postSignup/bcryptjs Error = ', err))
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err)
        res.redirect('/')
    })
}

exports.getReset = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    })
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
        }
        const token = buffer.toString('hex')
        const email = req.body.email
        User
            .findOne({ email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found!')
                    return res.redirect('/reset')
                }
                user.resetToken = token
                user.resetTokenExpiration = Date.now() + 3600000
                return user.save()
            })
            .then(result => {
                res.redirect('/')
                return sgMail
                    .send({
                        to: email,
                        from: 'xexete4658@etondy.com',
                        subject: 'Password reset',
                        html: `<h1>You requested was reset!</h1>
                               <p> Click this <a href="http://localhost:3000/reset/${token}">link</a> to a set a new password</p>`
                    })
                    .then((response) => {
                        console.log('sendgrig statusCode = ', response[0].statusCode)
                        console.log('sendgrig headers = ', response[0].headers)
                    })
            })
            .catch((err) => {
                console.log('postReset, fined user = ', err)
            })
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token
    User
        .findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error')
            if (message.length > 0) {
                message = message[0]
            } else {
                message = null
            }

            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            })
        })
        .catch((err) => {
            console.log('getNewPassword, fined user = ', err)
        })
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password
    const userId = req.body.userId
    const passwordToken = req.body.passwordToken
    let resetUser

    User
        .findOne({
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: Date.now() },
            _id: userId
        })
        .then(user => {
            resetUser = user
            return bcryptjs.hash(newPassword, 12)
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword
            resetUser.resetToken = undefined
            resetUser.resetTokenExpiration = undefined
            return resetUser.save()
        })
        .then(user => {
            res.redirect('/login')
        })
        .catch(err => {
            console.log(err)
        })
}
