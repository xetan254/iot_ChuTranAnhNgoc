const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database');

// Model đại diện cho bảng 'device' (Thiết bị điều khiển như LED, Quạt)
const Device = sequelize.define('Device', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'device'
});

module.exports = Device;
