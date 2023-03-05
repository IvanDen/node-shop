const bcryptjs = require('bcryptjs');
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    });
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false
    });
};

exports.postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({email: email});
        if (!user) {
            return res.redirect('/login');
        }
        const compareResult = bcryptjs.compare(password, user.password);
        if (compareResult) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
                console.log(err);
                res.redirect('/');
            })
        }
        return res.redirect('/login');
    } catch (err) {
        console.log(err);
        return res.redirect('/login');
    }
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({email: email})
        .then(userDoc => {
            if (userDoc) {
                return res.redirect('/signup');
            }
            return dcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: {
                            items: []
                        }
                    });
                    return user.save();
                })
                .then(result => {
                    return res.redirect('/login');
                });
        })

        .catch(err => console.log(err));
    ;
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/')
    })
};