const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../util/database');

const Order = sequelize.define('order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    razorpay_payment_id: DataTypes.STRING,
    razorpay_order_id: DataTypes.STRING,
    status: DataTypes.STRING
});

module.exports = Order;