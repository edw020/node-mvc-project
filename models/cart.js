const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Cart = sequelize.define('cart', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Cart;
/*
Old logic using file to manage cart
 const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');

const p = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
    static addProduct(id, price){
        // Fetch the previous cart
        fs.readFile(p, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0};
            if(!err){
                cart = JSON.parse(fileContent);
            }

            // analyze cart => find existing product
            const existingProductIndex = cart.products.findIndex(product => product.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            // add new product / increase quantity
            if(existingProduct){
                updatedProduct = {...existingProduct};
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = { id: id, qty: 1 };
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +price;
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            });
        });
    }

    static deleteProduct(id, productPrice){
        fs.readFile(p, (err, fileContent) => {
            if(err){
                return;
            }

            let cart = JSON.parse(fileContent);
            const updatedCart = {...cart};
            const product = updatedCart.products.find(prod => prod.id === id);

            if(product){
                const productQty = product.qty;
                updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
                updatedCart.totalPrice = updatedCart.totalPrice - (productPrice * productQty);

                fs.writeFile(p, JSON.stringify(updatedCart), err => {
                    console.log(err);
                });
            }
        });
    }

    static getProducts(cb) {
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent);

            if(err)
                cb(null);
            else
                cb(cart);
        });
    }
};*/