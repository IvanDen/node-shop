const express = require('express')
const { check, body } = require('express-validator')

const adminController = require('../controllers/admin')
const isAuth = require('../middleware/isAuth')

const router = express.Router()

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct)

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts)
//
// // /admin/add-product => POST
router.post(
    '/add-product',
    [
        body('title', 'Title should be not least 3 character or more then 80 character')
            .isString()
            .isLength({ min: 3, max: 80 })
            .trim(),
        body('imageUrl', 'Url is not valid').isURL(),
        body('price', 'Price is not valid').isFloat(),
        body('description', 'description doesn\'t follow the rules min: 5, max: 400 letters')
            .isLength({ min: 5, max: 400 })
            .trim()
    ],
    isAuth,
    adminController.postAddProduct)

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)

router.post(
    '/edit-product',
    [
        body('title', 'Title should be not least 3 character or more then 80 character')
            .isString()
            .isLength({ min: 3, max: 80 })
            .trim(),
        body('imageUrl', 'Url is not valid').isURL(),
        body('price', 'Price is not valid').isFloat(),
        body('description', 'description doesn\'t follow the rules min: 5, max: 400 letters')
            .isLength({ min: 5, max: 400 })
            .trim()
    ],
    isAuth,
    adminController.postEditProduct)
//
router.post('/delete-product', isAuth, adminController.postDeleteProduct)
//
module.exports = router
