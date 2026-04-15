const express = require('express');
const router = express.Router();
const ActionController = require('../controllers/ActionController');

// Định nghĩa các route liên quan đến trạng thái thiết bị
module.exports = () => {
    
    router.get('/device-status', ActionController.getDeviceStatus);
    router.get('/devices', ActionController.getAllDevices);
    return router;
};
