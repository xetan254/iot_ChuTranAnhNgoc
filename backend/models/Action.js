const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database');

// Model đại diện cho bảng 'actions' (Lịch sử tương tác/điều khiển thiết bị)
const Action = sequelize.define('Action', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    device_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    interacted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'actions'
});

module.exports = Action;
