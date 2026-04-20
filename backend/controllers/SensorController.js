const { Sensor, SensorData } = require('../models');
const { Op, Sequelize } = require('sequelize'); // Dùng Op và Sequelize.fn/where/literal cho tìm kiếm thời gian

const SensorController = {

    getAllSensors: async (req, res) => {
        try {
            const sensors = await Sensor.findAll({ attributes: ['id', 'name'] });
            res.json(sensors);
        } catch (error) {
            console.error('Lỗi lấy danh sách cảm biến:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    },

    getSensorData: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            // Lấy các parameter từ URL frontend gửi lên
            const { type, search, sensorName, timeSort, valueSort } = req.query;

            // 1. Khởi tạo điều kiện lọc (Where Clause)
            const whereClause = {};
            if (type && type !== 'all') {
                whereClause.type = type;
            }
            if (search) {
                // Tìm kiếm theo ID hoặc Giá trị
                whereClause[Op.or] = [
                    { id: { [Op.like]: `%${search}%` } },
                    { value: { [Op.like]: `%${search}%` } },
                    Sequelize.where(
                        Sequelize.fn('DATE_FORMAT', Sequelize.col('measured_at'), '%d/%m/%Y %H:%i:%s'),
                        { [Op.like]: `%${search}%` }
                    ),
                    Sequelize.where(
                        Sequelize.fn('DATE_FORMAT', Sequelize.col('measured_at'), '%Y-%m-%d %H:%i:%s'),
                        { [Op.like]: `%${search}%` }
                    ),
                    Sequelize.where(
                        Sequelize.fn(
                            'DATE_FORMAT',
                            Sequelize.fn('DATE_ADD', Sequelize.col('measured_at'), Sequelize.literal('INTERVAL 7 HOUR')),
                            '%d/%m/%Y %H:%i:%s'
                        ),
                        { [Op.like]: `%${search}%` }
                    ),
                    Sequelize.where(
                        Sequelize.fn(
                            'DATE_FORMAT',
                            Sequelize.fn('DATE_ADD', Sequelize.col('measured_at'), Sequelize.literal('INTERVAL 7 HOUR')),
                            '%d/%m/%Y, %H:%i:%s'
                        ),
                        { [Op.like]: `%${search}%` }
                    )
                ];
            }

            // Lọc theo bảng liên kết (bảng Sensor)
            const includeClause = [{
                model: Sensor,
                as: 'sensorInfo',
                attributes: ['name']
            }];
            if (sensorName && sensorName !== 'all') {
                includeClause[0].where = { name: sensorName };
            }

            // 2. Khởi tạo điều kiện sắp xếp (Order Clause)
            let orderClause = [];
            // Nếu người dùng chọn sắp xếp theo giá trị, ưu tiên xếp giá trị trước
            if (valueSort && valueSort !== 'none') {
                orderClause.push(['value', valueSort === 'asc' ? 'ASC' : 'DESC']);
            }
            // Sắp xếp theo thời gian
            const timeDirection = timeSort === 'asc' ? 'ASC' : 'DESC';
            orderClause.push(['measured_at', timeDirection]);

            // 3. Thực thi truy vấn vào cơ sở dữ liệu
            const results = await SensorData.findAll({
                where: whereClause,
                include: includeClause,
                order: orderClause,
                limit,
                offset
            });

            // Đếm tổng số lượng bản ghi (để làm phân trang)
            const totalItems = await SensorData.count({
                where: whereClause,
                include: includeClause
            });

            // Format dữ liệu trả về cho FE
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
                currentPage: page
            });

        } catch (error) {
            console.error('Lỗi lấy dữ liệu cảm biến:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    },

    getChartData: async (req, res) => {
        try {
            const { Sequelize } = require('sequelize');
            const results = await SensorData.findAll({
                attributes: [
                    'type',
                    'value',
                    [Sequelize.fn('DATE_FORMAT', Sequelize.col('measured_at'), '%H:%i:%s'), 'time']
                ],
                order: [['measured_at', 'DESC']],
                limit: 120
            });
            res.json(results.reverse());
        } catch (error) {
            console.error('Lỗi lấy dữ liệu biểu đồ:', error);
            res.status(500).json({ error: 'Lỗi máy chủ' });
        }
    },

    getHealth: (req, res, lastSeen) => {
        const isOnline = (Date.now() - lastSeen) < 10000;
        res.json({ online: isOnline });
    }
};

module.exports = SensorController;