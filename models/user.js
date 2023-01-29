const mongodb = require('mongodb');
const {getDb, getCollection} = require("../util/database");
const {ObjectId} = require("mongodb");


class User {
    constructor(userName, email, cart, id) {
        this.name = userName;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        return getCollection('user')
            .insertOne(this)
            .then(result => {
                console.log(result)
            })
            .catch(err => {
                console.log(err);
            });
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items
            .findIndex(cp => cp.productId.toString() === product._id.toString());

        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems
                .push({
                    productId: new ObjectId(product._id),
                    quantity: newQuantity
                });
        }


        const updateCart = {
            items: updatedCartItems
        };

        return getCollection('users')
            .updateOne(
                {_id: new ObjectId(this._id)},
                {$set: {cart: updateCart}}
            );

    }

    getCart() {
        const productsIds = this.cart.items.map(i => {
            return i.productId;
        });
        return getCollection('products')
            .find({_id: {$in: productsIds}})
            .toArray()
            .then(products => {
                return products.map(p => {
                    const quantity = this.cart.items
                        .find(i => i.productId.toString() === p._id.toString()).quantity;
                    return {
                        ...p, quantity: quantity
                    }
                });
            })
            .catch(err => {
                console.log(err);
            });

    }

    deleteItemFromCart(productId) {
        const updateCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });
        return getCollection('users')
            .updateOne(
                {_id: new ObjectId(this._id)},
                {$set: {cart: {items: updateCartItems}}}
            );
    }

    addOrder() {
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new ObjectId(this._id),
                        name: this.name
                    }
                }
                return getCollection('orders')
                    .insertOne(order)

            })
            .then(result => {
                this.cart = {items: []}
                return getCollection('orders')
                    .updateOne(
                        {_id: new ObjectId(this._id)},
                        {$set: {cart: {items: []}}}
                    )
            })
    }

    getOrders() {
        return getCollection('orders')
            .find({'user._id': new ObjectId(this._id)})
            .toArray();

    }

    static findById(userId) {
        return getCollection('users')
            .findOne({_id: new ObjectId(userId)})
            .then(user => {
                console.log("user findById = ", user);
                return user;
            })
            .catch(err => {
                console.log(err);
            });
    }
}

module.exports = User;