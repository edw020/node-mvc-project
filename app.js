const path = require('path');
const fs = require('fs');
const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const errorsController = require('./controllers/error');
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');
//const mongoConnect = require('./util/database').mongoConnect; OLD mongodb lib used for connection
const User = require('./models/user');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-hehis.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
// Initializing CSRF protection middleware from lib with default config
const csrfProtection = csrf();

// Defining key and cert values for SSL implementation
// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

// Setting storage config object for defining 'images' as storage folder, and a unique filename
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString()+'-'+file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg')
        cb(null, true);
    else
        cb(null, false);
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Defining stream config to include on morgan setup to define were to log
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

// Using helmet for adding extra protection for prod use
app.use(helmet());
// Using compression for reduce size on assets
app.use(compression());
// Setting morgan for logging
app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.urlencoded({ extended: false }));
// Sets multer MW so it can parse on post requests for any file named 'image'.
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
// Set's up session using library and includes store config var to indicate saving sessions on mongodb
app.use(session({secret: 'my secret', resave: false, saveUninitialized: false, store: store}));

// Setting middleware for handling one-time-use session vars (errors in this case)
app.use(flash());

app.use((req, res, next) => {
    // locals only exists on views rendered so anything stored in locals will be available on any view file to be rendered
    res.locals.isAuthenticated = req.session.isLoggedIn;
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
// This request will be excluded from CSRF protection
app.post('/create-order', isAuth, shopController.postOrder);

// Setting CSRF protection middleware into app
app.use(csrfProtection);

app.use((req, res, next) => {
    // locals only exists on views rendered so anything stored in locals will be available on any view file to be rendered
    res.locals.csrfToken = req.csrfToken(); // fn provided by 'csurf' library
    next();
});

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
    console.log(error);
    res.status(500).render('500', { pageTitle: 'Error', path: '' });
});

mongoose.connect(MONGODB_URI)
    .then(result => {
        /*
        Configuration enabling SSL encryption
        https
            .createServer({key: privateKey, cert: certificate}, app)
            .listen(process.env.PORT || 3000);*/

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


