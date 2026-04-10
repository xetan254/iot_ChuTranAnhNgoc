const express = require('express');
const router = express.Router();
const ActionController = require('../controllers/ActionController');

// Định nghĩa các route liên quan đến trạng thái thiết bị
module.exports = () => {
    
    // API Lấy trạng thái ON/OFF hiện tại của các thiết bị
    router.get('/device-status', ActionController.getDeviceStatus);

    return router;
};
