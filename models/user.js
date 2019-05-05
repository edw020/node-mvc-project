const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class User {
    constructor(username, email, cart, id){
        this.name = username;
        this.email = email;
        this.cart = cart; // {items: []}
        this._id = id || null;
    }

    save(){
        const db = getDb();
        let dbOp;
        if(this._id){
            dbOp = db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this });
        } else {
            dbOp = db.collection('users').insertOne(this);
        }

        return dbOp
            .then(result => {
                console.log(result);
            })
            .catch(err => console.log(err));
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(cp => cp.productId.toString() === product._id.toString());

        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        if(cartProductIndex >= 0){
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({productId: new mongodb.ObjectId(product._id) , quantity: newQuantity})
        }

        const db = getDb();
        return db.collection('users').updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: {cart: {items: updatedCartItems}}});
    }

    getCart(){
        const db = getDb();
        const productIds = this.cart.items.map(item => item.productId);
        return db.collection('products').find({_id: {$in: productIds}}).toArray().then(
            products => {
                return products.map(product => ({ ...product, quantity: this.cart.items.find(item => item.productId.toString() === product._id.toString()).quantity }));
            }
        );
    }

    deleteItemFromCart(productId){
        const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());

        const db = getDb();
        return db.collection('users').updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: {cart: {items: updatedCartItems}}});
    }

    addOrder(){
        const db = getDb();

        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new mongodb.ObjectId(this._id),
                        name: this.name,
                    }
                };

                return db.collection('orders').insertOne(order);
            })
            .then(result => {
                return db.collection('users').updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: {cart: {items: []}}});
            })
            .catch(err => console.log(err));
    }

    getOrders(){
        const db = getDb();

        return db.collection('orders').find({'user._id': new mongodb.ObjectId(this._id)}).toArray();
    }

    static findById(userId){
        const db = getDb();
        return db.collection('users').findOne({_id: new mongodb.ObjectId(userId)});
    }
}

module.exports = User;