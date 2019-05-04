const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    const product = new Product(title, imageUrl, description, price);
    product.save()
        .then(() => {
            res.redirect('/');
        })
        .catch(err => console.log(err));
    // products.push({ title: req.body.title });
};

// exports.getEditProduct = (req, res, next) => {
//     // This for showing how query params work ( /admin/edit-product/:productId?edit=true )
//     const editMode = req.query.edit;
//
//     if(!editMode)
//         return res.redirect('/');
//
//     const prodId = req.params.productId;
//
//     req.user.getProducts({where: {id: prodId}})
//     //Product.findByPk(prodId)
//         .then(products => {
//             const product = products[0];
//             if (!product)
//                 return res.redirect('/');
//
//             res.render('admin/edit-product', {
//                 pageTitle: 'Edit Product',
//                 path: '/admin/edit-product',
//                 editing: editMode,
//                 product: product
//             });
//         })
//         .catch(err => console.log(err));
//
//
//     /*Product.findById(prodId, product => {
//         if(!product)
//             return res.redirect('/');
//
//         res.render('admin/edit-product', {
//             pageTitle: 'Edit Product',
//             path: '/admin/edit-product',
//             editing: editMode,
//             product: product
//         });
//     });*/
// };
//
// exports.postEditProduct = (req, res, next) => {
//     const prodId = req.body.productId;
//     const updatedTitle = req.body.title;
//     const updatedPrice = req.body.price;
//     const updatedImageUrl = req.body.imageUrl;
//     const updatedDesc = req.body.description;
//
//     Product.findByPk(prodId)
//         .then(product => {
//             product.title = updatedTitle;
//             product.price = updatedPrice;
//             product.imageUrl = updatedImageUrl;
//             product.description = updatedDesc;
//             return product.save();
//         })
//         .then(result => {
//             console.log('UPDATED PRODUCT!');
//             res.redirect('/admin/products');
//         })
//         .catch(err => console.log(err));
//
//     /* const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl, updatedDesc, updatedPrice);
//
//     updatedProduct.save();
//
//     res.redirect('/admin/products');*/
// };
//
exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => console.log(err));
};
//
// exports.postDeleteProduct = (req, res, next) => {
//     const prodId = req.body.productId;
//
//     Product.findByPk(prodId)
//         .then(product => {
//             return product.destroy();
//         })
//         .then(result => {
//             console.log('DESTROYED PRODUCT');
//             res.redirect('/admin/products');
//         })
//         .catch(err => console.log(err));
//
//     //Product.deleteById(prodId);
//     //res.redirect('/admin/products');
// };