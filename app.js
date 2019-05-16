const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorsController = require('./controllers/error');
//const mongoConnect = require('./util/database').mongoConnect; OLD mongodb lib used for connection
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://edward:P4ssw0rd2o19@cluster0-hehis.mongodb.net/shop';

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
// Initializing CSRF protection middleware from lib with default config
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// Set's up session using library and includes store config var to indicate saving sessions on mongodb
app.use(session({secret: 'my secret', resave: false, saveUninitialized: false, store: store}));

// Setting CSRF protection middleware into app
app.use(csrfProtection);
// Setting middleware for handling one-time-use session vars (errors in this case)
app.use(flash());

app.use((req, res, next) => {
    // locals only exists on views rendered so anything stored in locals will be available on any view file to be rendered
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken(); // fn provided by 'csurf' library
    next();
});

app.use((req, res, next) => {
    if(!req.session.user){
        return next();
    }

    User.findById(req.session.user._id)
        .then(user => {
            if(!user)
                return next();

            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});

// Will obtain the user for every incoming request and will store result in req param (Note that this middleware is registered before the routed ones)
/*app.use((req, res, next) => {
    User.findById('5cd0e1bb11051e1c0d0eb74e')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});*/

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// Will set an error url with error content
app.get('/500', errorsController.get500);
// For sending 404 on no valid url
app.use(errorsController.get404);
// sets an error middleware (including error param first)
app.use((error, req, res, next) => {
    // res.status(error.httpStatusCode).render(...);
    // res.redirect('/500');
    res.status(500).render('500', { pageTitle: 'Error', path: '' });
});

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(3001);
        /* Old logic used when authentication wasn't implemented
        User.findOne()
            .then(user => {
                if(!user){
                    const user = new User({
                        name: 'Edward',
                        email: 'edward@testing.com',
                        cart: {
                            items:[]
                        }
                    });
                    user.save();
                }
            })
            .catch(err => console.log(err));*/

    })
    .catch(err => console.log(err));

/*mongoConnect(() => {
    app.listen(3001);
});*/


