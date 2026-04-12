const { Sensor, SensorData } = require('../models');
const { Sequelize } = require('sequelize');

// Quản lý dữ liệu cảm biến
const SensorController = {
    getSensorData: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const offset = parseInt(req.query.offset) || 0;

            const totalItems = await SensorData.count();

            const results = await SensorData.findAll({
                include: [{
                    model: Sensor,
                    as: 'sensorInfo',
                    attributes: ['name']
                }],
                order: [['measured_at', 'DESC']],
                limit,
                offset
            });

            const formatted = results.map(item => ({
                id: item.id,
                sensor_name: item.sensorInfo ? item.sensorInfo.name : 'Unknown',
                type: item.type,
                value: item.value,
                measured_at: item.measured_at
            }));

            const totalPages = Math.max(1, Math.ceil(totalItems / limit));

            res.json({
                data: formatted,
                totalItems,
                totalPages,
                currentPage: Math.floor(offset / limit) + 1
            });
        } catch (error) {
            console.error('Lỗi lấy dữ liệu cảm biến:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    },

    getChartData: async (req, res) => {
        try {
            const results = await SensorData.findAll({
                attributes: [
                    'type',
                    'value',
                    [Sequelize.fn('DATE_FORMAT', Sequelize.col('measured_at'), '%H:%i:%s'), 'time']
                ],
                order: [['measured_at', 'DESC']],
                limit: 120
            });

            // Gửi dữ liệu theo thứ tự thời gian tăng dần cho biểu đồ
            res.json(results.reverse());
        } catch (error) {
            console.error('Lỗi lấy dữ liệu biểu đồ:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    },

    // API Kiểm trạng thái hoạt động (Health)
    getHealth: (req, res, lastSeen) => {
        // Nếu quá 10s không thấy tăm hơi ESP32 -> Tính là mất kết nối
        const isOnline = (Date.now() - lastSeen) < 10000;
        res.json({ online: isOnline });
    }
};

module.exports = SensorController;
