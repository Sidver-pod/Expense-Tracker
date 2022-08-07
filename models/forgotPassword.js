const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../util/database');

const ForgotPassword = sequelize.define('ForgotPassword', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
});

module.exports = ForgotPassword;