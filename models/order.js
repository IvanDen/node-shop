const {INTEGER, STRING, DOUBLE} = require('sequelize');
const sequelize = require("../util/database");

class Order {
    constructor(id) {
        this.id = id;
    }

    static fetchAll() {
        console.log('Empty fetch method');
    }
}

module.exports = Order;