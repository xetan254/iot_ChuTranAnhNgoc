const Sensor = require('./Sensor');
const SensorData = require('./SensorData');
const Device = require('./Device');
const Action = require('./Action');

// Thiết lập quan hệ (Associations)

// Một cảm biến có nhiều lượt ghi dữ liệu
Sensor.hasMany(SensorData, { foreignKey: 'sensor_id' });
SensorData.belongsTo(Sensor, { foreignKey: 'sensor_id', as: 'sensorInfo' });

// Một thiết bị có nhiều lượt ghi lịch sử hành động
Device.hasMany(Action, { foreignKey: 'device_id' });
Action.belongsTo(Device, { foreignKey: 'device_id', as: 'deviceInfo' });

module.exports = {
    Sensor,
    SensorData,
    Device,
    Action
};
