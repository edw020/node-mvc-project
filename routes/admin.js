const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', [
    body('title', 'Invalid value for Title')
        .isString()
        .isLength({min: 3})
        .trim(),
    body('imageUrl', 'Invalid value for Image URL').isURL(),
    body('price', 'Invalid value for Price').isFloat(),
    body('description', 'Invalid value for Description')
        .isLength({min: 5, max: 400})
        .trim()
], isAuth, adminController.postAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post('/edit-product', [
    body('title', 'Invalid value for Title')
        .isString()
        .isLength({min: 3})
        .trim(),
    body('imageUrl', 'Invalid value for Image URL').isURL(),
    body('price', 'Invalid value for Price').isFloat(),
    body('description', 'Invalid value for Description')
        .isLength({min: 5, max: 400})
        .trim()
], isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
