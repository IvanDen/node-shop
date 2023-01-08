const {INTEGER, STRING, DOUBLE} = require('sequelize');
const sequelize = require("../util/database");

const Order = sequelize.define('order', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Order;