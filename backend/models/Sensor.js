const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database');

// Model đại diện cho bảng 'sensor' (Cảm biến)
const Sensor = sequelize.define('Sensor', {
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
    tableName: 'sensor'
});

module.exports = Sensor;
