const mongodb = require('mongodb');
const {getDb} = require("../util/database");
const {ObjectId} = require("mongodb");


class User {
    constructor(userName, email, cart, id) {
        this.name = userName;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = getDb();
        return db.collection('user')
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

        if(cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        }
        else {
            updatedCartItems
                .push({
                    productId: new ObjectId(product._id),
                    quantity: newQuantity
                });
        }


        const updateCart = {
            items: updatedCartItems
        };

        const db = getDb();
        return db
            .collection('users')
            .updateOne(
                {_id: new ObjectId(this._id)},
                {$set: { cart: updateCart }}
            );

    }

    static findById(userId) {
        const db = getDb();
        return db
            .collection('users')
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