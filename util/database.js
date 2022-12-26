const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(
    'node-complete',
    'root',
    'P@ssword', {
        dialect:'mysql',
        host: 'localhost'
    }
);

module.exports = sequelize;