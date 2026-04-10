const mqtt = require('mqtt');
const EventEmitter = require('events');
const MqttService = require('../services/MqttService');
require('dotenv').config();

// Biến theo dõi thời gian "sống" cuối cùng của mạch ESP32
let lastSeen = Date.now();
const updateLastSeen = (time) => { lastSeen = time; };
const getLastSeen = () => lastSeen;

// Cấu hình kết nối MQTT Broker
const mqttClient = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883', {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS
});

// Đối tượng thông báo sự kiện để đồng bộ hóa Feedback từ ESP32
const mqttEvents = new EventEmitter();

mqttClient.on('connect', () => {
    console.log('Đã kết nối MQTT Broker!');
    mqttClient.subscribe('data_sensor');
    mqttClient.subscribe('status');
    mqttClient.subscribe('request_sync');
});

// Chuyển toàn bộ việc lắng nghe tin nhắn vào đây để server.js gọn gàng
mqttClient.on('message', (topic, message) => {
    MqttService.handleMessage(topic, message, mqttClient, mqttEvents, updateLastSeen);
});

mqttClient.on('error', (err) => {
    console.error('Lỗi kết nối MQTT:', err);
});

module.exports = { mqttClient, mqttEvents, getLastSeen };
