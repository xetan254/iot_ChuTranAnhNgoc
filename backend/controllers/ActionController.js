const { Device, Action } = require('../models');
const { Sequelize } = require('sequelize');

// Quản lý lịch sử và điều khiển thiết bị
const ActionController = {
    // API Lấy lịch sử hành động (Phân trang)
    getActionHistory: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const offset = parseInt(req.query.offset) || 0;

            const results = await Action.findAll({
                include: [{
                    model: Device,
                    as: 'deviceInfo',
                    attributes: ['name']
                }],
                order: [['interacted_at', 'DESC']],
                limit,
                offset
            });

            // Map lại format cũ cho Frontend
            const formatted = results.map(item => ({
                id: item.id,
                device_name: item.deviceInfo ? item.deviceInfo.name : 'Unknown',
                action: item.action,
                status: item.status,
                interacted_at: item.interacted_at
            }));

            res.json(formatted);
        } catch (error) {
            console.error('Lỗi lấy lịch sử hành động:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    },

    // API Bật/Tắt thiết bị (Xử lý Control)
    controlDevice: async (req, res, mqttClient, mqttEvents) => {
        try {
            const { deviceId, deviceCode, action } = req.body;

            // Lưu trạng thái 'waiting' vào DB trước khi gửi qua MQTT
            const newAction = await Action.create({
                device_id: deviceId,
                action: action.toUpperCase(),
                status: 'waiting'
            });

            const actionId = newAction.id;

            // Gửi lệnh qua MQTT
            mqttClient.publish('control', JSON.stringify({ device: deviceCode, action: action }));

            let timeout;

            // Hàm callback khi nhận lời được phản hồi từ ESP32
            const onFeedback = (status) => {
                clearTimeout(timeout);
                if (!res.headersSent) {
                    res.json({ success: true });
                }
            };

            // Hook vào sự kiện feedback của MQTT config
            mqttEvents.once(`feedback_${deviceCode}`, onFeedback);

            // Timeout 10s: Nếu không phản hồi -> FAILED
            timeout = setTimeout(async () => {
                mqttEvents.removeListener(`feedback_${deviceCode}`, onFeedback);

                await Action.update({ status: 'FAILED' }, { where: { id: actionId } });

                if (!res.headersSent) {
                    res.status(408).json({ error: 'Thiết bị không phản hồi' });
                }
            }, 10000);

        } catch (error) {
            console.error('Lỗi khi điều khiển thiết bị:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    },

    // API Lấy trạng thái hiện tại (Gần nhất) của các thiết bị
    getDeviceStatus: async (req, res) => {
        try {
            // Lấy trạng thái ON/OFF hợp lệ gần nhất cho từng thiết bị
            const results = await Action.findAll({
                attributes: ['device_id', 'action', 'status'],
                where: {
                    id: {
                        [Sequelize.Op.in]: Sequelize.literal(`(SELECT MAX(id) FROM actions WHERE status IN ('ON', 'OFF', 'on', 'off') GROUP BY device_id)`)
                    }
                }
            });
            res.json(results);
        } catch (error) {
            console.error('Lỗi lấy trạng thái thiết bị:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = ActionController;
