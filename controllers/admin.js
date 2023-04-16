const Product = require('../models/product')
const { validationResult } = require('express-validator')
const { errorHandler } = require('../util/errorHandler')

exports.getAddProduct = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login')
    }
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
}

exports.postAddProduct = (req, res, next) => {
    const { title, imageUrl, price, description } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .render('admin/edit-product', {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                editing: false,
                hasError: true,
                product: {
                    title, imageUrl, price, description
                },
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array()
            })
    }

    const product = new Product({
        title,
        imageUrl,
        price,
        description,
        userId: req.user
    })
    product
        .save()
        .then(result => {
            console.log('The new product was created')
            res.redirect('/admin/products')
        })
        .catch(err => {
            // return res
            //     .status(500)
            //     .render('admin/edit-product', {
            //         pageTitle: 'Add Product',
            //         path: '/admin/add-product',
            //         editing: false,
            //         hasError: true,
            //         product: {
            //             title, imageUrl, price, description
            //         },
            //         errorMessage: 'Database operation failed, please try again.',
            //         validationErrors: []
            //     })
            // res.redirect('/500')
            return errorHandler(err, next)
        })
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit
    if (!editMode) {
        return res.redirect('/')
    }
    const prodId = req.params.productId

    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/')
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                hasError: true,
                product,
                errorMessage: null,
                validationErrors: []
            })
        })
        .catch(err => errorHandler(err, next))
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId
    const updatedTitle = req.body.title
    const updatedImageUrl = req.body.imageUrl
    const updatedPrice = req.body.price
    const updatedDesc = req.body.description

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: true,
                hasError: true,
                product: {
                    title: updatedTitle,
                    imageUrl: updatedImageUrl,
                    price: updatedPrice,
                    description: updatedDesc,
                    _id: prodId
                },
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array()
            })
    }

    Product
        .findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/')
            }
            product.title = updatedTitle
            product.price = updatedPrice
            product.description = updatedDesc
            product.imageUrl = updatedImageUrl
            return product
                .save()
                .then(result => {
                    console.log('UPDATED PRODUCT ID = ', prodId)
                    res.redirect('/admin/products')
                })
        })
        .catch(err => errorHandler(err, next))
}

exports.getProducts = (req, res, next) => {
    Product
        .find({ userId: req.user._id })
        // .select('title price -_id')
        // .populate('userId', 'name')
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            })
        })
        .catch(err => errorHandler(err, next))
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId
    Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(result => {
            console.log('UPDATED PRODUCT ID = ', prodId)
            res.redirect('/admin/products')
        })
        .catch(err => errorHandler(err, next))
}
