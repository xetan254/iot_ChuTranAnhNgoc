const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database');

// Model đại diện cho bảng 'sensor_data' (Dữ liệu lịch sử cảm biến)
const SensorData = sequelize.define('SensorData', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sensor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    measured_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'sensor_data'
});

module.exports = SensorData;
