const {INTEGER, STRING, DOUBLE} = require('sequelize');
const sequelize = require("../util/database");

const OrderItem = sequelize.define('orderItem', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: INTEGER
});

module.exports = OrderItem;