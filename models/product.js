const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    imageUrl: {
        type: String,
        require: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true
    }
});

module.exports = mongoose.model("Product", productSchema);


//
// class Product {
//     constructor(title, price, description, imageUrl, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? new ObjectId(id) : null;
//         this.userId = userId;
//     }
//
//     save() {
//         const db = getDb();
//         let dbOperation;
//         if (this._id) {
//             dbOperation = db
//                 .collection('products')
//                 .updateOne(
//                     {_id: this._id},
//                     {$set: this}
//                 )
//         }
//         else {
//             dbOperation = db
//                 .collection('products')
//                 .insertOne(this)
//         }
//         return dbOperation
//             .then(result => {
//                 console.log(result)
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }
//
//     static fetchAll() {
//         const db = getDb();
//         return db
//             .collection('products')
//             .find()
//             .toArray()
//             .then(products => {
//                 console.log(products);
//                 return products;
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }
//
//     static findById(prodId) {
//         const db = getDb();
//         return db
//             .collection('products')
//             .find({_id: new mongodb.ObjectId(prodId)})
//             .next()
//             .then(products => {
//                 console.log(products);
//                 return products;
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }
//
//     static deleteById(prodId) {
//         const db = getDb();
//         return db
//             .collection('products')
//             .deleteOne({_id: new ObjectId(prodId)})
//             .then(res => {
//                 console.log("Deleted");
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }
// }
//
// module.exports = Product;