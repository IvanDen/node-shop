const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoBDStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

require('dotenv').config();

const app = express();
const store = new MongoBDStore({
    uri: process.env.MONGO_DB_CONNECTION_STRING,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err))
})

app.use((req, res, next) => {

    User.findById('63d6a50340f06f56000dfc59')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});
//
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(process.env.MONGO_DB_CONNECTION_STRING)
    .then(res => {
        User.findOne()
            .then(user => {
                if (!user) {
                    const user = new User({
                        name: 'Vano',
                        email: 'max@test.com',
                        cart: {
                            items: []
                        }
                    });
                    user.save();
                }
            })
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });



