const express = require('express');
const router = express.Router();
const SensorController = require('../controllers/SensorController');

// Định nghĩa các route liên quan đến cảm biến và trạng thái ESP32
module.exports = (getLastSeen) => {
    router.get('/sensors', SensorController.getAllSensors);
    // API Lấy lịch sử dữ liệu cảm biến 
    router.get('/sensor-data', SensorController.getSensorData);

    // API Lấy dữ liệu biểu đồ
    router.get('/chart-data', SensorController.getChartData);
    
    // API Kiểm tra online status
    router.get('/health', (req, res) => SensorController.getHealth(req, res, getLastSeen()));

    return router;
};
