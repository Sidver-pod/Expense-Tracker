const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../util/database');

const DownloadHistory = sequelize.define('downloadHistory', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    url: {
        type: DataTypes.STRING
    }
});

module.exports = DownloadHistory;