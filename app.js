const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorsController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Will obtain the user for every incoming request and will store result in req param (Note that this middleware is registered before the routed ones)
app.use((req, res, next) => {
    /*User.findByPk(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));*/
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
// For sending 404 on no valid url
app.use(errorsController.get404);

mongoConnect(() => {
    app.listen(3001);
});


