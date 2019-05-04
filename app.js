const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorsController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Will obtain the user for every incoming request and will store result in req param (Note that this middleware is registered before the routed ones)
app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorsController.get404);

// Setting up associations between tables
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, {through: OrderItem});


// Check all models and create tables on db if doesn't exist
// sequelize.sync({force: true}) overwrites the tables on start if need to update a table
sequelize.sync()
    .then(result => {
        return User.findByPk(1);
        //console.log(result);
    })
    .then(user => {
        if(!user){
            return User.create({name: 'Edward', email: 'edward@testing.com'});
        }
        return user;
    })
    .then(user => {
        return user.getCart()
            .then(cart => {
                if(cart)
                    return cart;
                else
                    return user.createCart();
            })
            .catch(err => {console.log(err)});
    })
    .then(cart => {
        //console.log(user);
        app.listen(3001);
    })
    .catch(err => console.log(err));
