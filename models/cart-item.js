const {INTEGER, STRING, DOUBLE} = require('sequelize');
const sequelize = require("../util/database");

const CartItem = sequelize.define('cartItem', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: INTEGER
});

module.exports = CartItem;