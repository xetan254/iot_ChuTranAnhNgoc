const { Device, Action } = require('../models');
const { Sequelize, Op } = require('sequelize'); // Hỗ trợ tìm kiếm và toán tử

// Quản lý lịch sử và điều khiển thiết bị
const ActionController = {
    // API Lấy danh sách thiết bị
    getAllDevices: async (req, res) => {
        try {
            const devices = await Device.findAll({
                attributes: ['id', 'name']
            });
            res.json(devices);
        } catch (error) {
            console.error('Lỗi lấy danh sách thiết bị:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    },

    // API Lấy lịch sử hành động (Đã tích hợp Lọc từ DB)
    getActionHistory: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const offset = parseInt(req.query.offset) || 0;
            
            // Lấy các tham số Frontend gửi lên
            const status = req.query.status;
            const search = req.query.search;
            const deviceName = req.query.deviceName;
            const timeSort = req.query.timeSort;

            const whereClause = {};

            // 1. Lọc theo trạng thái
            if (status && status !== 'all') {
                whereClause.status = status;
            }

            // 2. Lọc theo từ khóa (Ép kiểu ID về chuỗi để tránh lỗi LIKE trên kiểu số)
            if (search) {
                whereClause[Op.or] = [
                    Sequelize.where(Sequelize.cast(Sequelize.col('Action.id'), 'CHAR'), { [Op.like]: `%${search}%` }),
                    { action: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } },
                    Sequelize.where(Sequelize.fn('DATE_FORMAT', Sequelize.col('interacted_at'), '%d/%m/%Y %H:%i:%s'), 'LIKE', `%${search}%`),
                    Sequelize.where(Sequelize.fn('DATE_FORMAT', Sequelize.col('interacted_at'), '%Y-%m-%d %H:%i:%s'), 'LIKE', `%${search}%`),
                    Sequelize.where(
                        Sequelize.fn('DATE_FORMAT', Sequelize.fn('DATE_ADD', Sequelize.col('interacted_at'), Sequelize.literal('INTERVAL 7 HOUR')), '%d/%m/%Y %H:%i:%s'),
                        'LIKE', `%${search}%`
                    ),
                    Sequelize.where(
                        Sequelize.fn('DATE_FORMAT', Sequelize.fn('DATE_ADD', Sequelize.col('interacted_at'), Sequelize.literal('INTERVAL 7 HOUR')), '%d/%m/%Y, %H:%i:%s'),
                        'LIKE', `%${search}%`
                    )
                ];
            }

            // 3. Lọc theo tên thiết bị (Join bảng Device)
            const includeClause = [{
                model: Device,
                as: 'deviceInfo',
                attributes: ['name']
            }];

            if (deviceName && deviceName !== 'all') {
                includeClause[0].where = { name: deviceName };
            }

            const timeOrder = timeSort === 'asc' ? 'ASC' : 'DESC';

            // 4. Dùng findAndCountAll (An toàn và tối ưu hơn findAll + count)
            const { count, rows } = await Action.findAndCountAll({
                where: whereClause,
                include: includeClause,
                order: [['interacted_at', timeOrder]],
                limit,
                offset,
                distinct: true // Bắt buộc dùng distinct khi có count đi kèm include
            });

            // Map lại format cũ cho Frontend
            const formatted = rows.map(item => ({
                id: item.id,
                device_name: item.deviceInfo ? item.deviceInfo.name : 'Unknown',
                action: item.action,
                status: item.status,
                interacted_at: item.interacted_at
            }));

            res.json({
                data: formatted,
                totalItems: count,
                totalPages: Math.max(1, Math.ceil(count / limit)),
                currentPage: Math.floor(offset / limit) + 1
            });
        } catch (error) {
            console.error('Lỗi lấy lịch sử hành động:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    },

    // API Bật/Tắt thiết bị 
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
            const results = await Action.findAll({
                attributes: ['device_id', 'action', 'status'],
                where: {
                    id: {
                        // Sửa [Sequelize.Op.in] thành [Op.in]
                        [Op.in]: Sequelize.literal(`(SELECT MAX(id) FROM actions WHERE status IN ('ON', 'OFF', 'on', 'off') GROUP BY device_id)`)
                    }
                }
            });
            res.json(results);
        } catch (error) {
            console.error('Lỗi lấy trạng thái thiết bị:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    },

    // API Thống kê số lần bật/tắt thiết bị theo ngày
    getDailyStats: async (req, res) => {
        try {
            const results = await Action.findAll({
                attributes: [
                    [Sequelize.fn('DATE', Sequelize.col('interacted_at')), 'date'],
                    'device_id',
                    // Đếm riêng số lần Bật (ON)
                    [Sequelize.literal(`SUM(CASE WHEN status IN ('ON', 'on') THEN 1 ELSE 0 END)`), 'on_count'],
                    // Đếm riêng số lần Tắt (OFF)
                    [Sequelize.literal(`SUM(CASE WHEN status IN ('OFF', 'off') THEN 1 ELSE 0 END)`), 'off_count']
                ],
                where: {
                    status: ['ON', 'OFF', 'on', 'off'] 
                },
                group: [Sequelize.fn('DATE', Sequelize.col('interacted_at')), 'device_id'],
                // Sắp xếp ngày mới nhất lên đầu để Frontend tự động chọn ngày gần nhất
                order: [[Sequelize.fn('DATE', Sequelize.col('interacted_at')), 'DESC']]
            });
            res.json(results);
        } catch (error) {
            console.error('Lỗi lấy thống kê thiết bị:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    }
};
    
module.exports = ActionController;