const express = require('express');
const router = express.Router();
const ActionController = require('../controllers/ActionController');

// Định nghĩa các route liên quan đến Lịch sử và Điều khiển thiết bị
module.exports = (mqttClient, mqttEvents) => {
    
    // API Lấy lịch sử hành động
    router.get('/action-history', ActionController.getActionHistory);

    // API Bật/Tắt thiết bị (Gửi lệnh qua MQTT)
    router.post('/control', (req, res) => 
        ActionController.controlDevice(req, res, mqttClient, mqttEvents)
    );

    return router;
};
