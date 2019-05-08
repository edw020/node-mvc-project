const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorsController = require('./controllers/error');
//const mongoConnect = require('./util/database').mongoConnect; OLD mongodb lib used for connection
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Will obtain the user for every incoming request and will store result in req param (Note that this middleware is registered before the routed ones)
app.use((req, res, next) => {
    User.findById('5cd0e1bb11051e1c0d0eb74e')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
// For sending 404 on no valid url
app.use(errorsController.get404);

mongoose.connect('mongodb+srv://edward:P4ssw0rd2o19@cluster0-hehis.mongodb.net/shop?retryWrites=true')
    .then(result => {
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
            .catch(err => console.log(err));

        app.listen(3001);
    })
    .catch(err => console.log(err));

/*mongoConnect(() => {
    app.listen(3001);
});*/


