// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;
//
// let _db;
// const mongoConnect = (callback) => {
//     MongoClient.connect('mongodb+srv://adminMDB:mdbPassword@cluster0.ezqpsen.mongodb.net/?retryWrites=true&w=majority')
//         .then(client => {
//             console.log('Connected to mongoDB');
//             _db = client.db();
//             callback();
//         })
//         .catch(err => {
//             console.log(err);
//             throw err;
//         })
// }
//
// const getDb = () => {
//     if (_db) {
//         return _db;
//     }
//     throw 'No database found!';
// }
//
// function getCollection(collectionName) {
//     const db = getDb();
//     return db.collection(collectionName)
// }
//
// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;
// exports.getCollection = getCollection;
//
