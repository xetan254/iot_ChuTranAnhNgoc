const express = require('express');
const cors = require('cors');
const sequelize = require('./config/Database');
const { mqttClient, mqttEvents, getLastSeen } = require('./config/Mqtt');

// Nạp các Router chuyên biệt (Modular Routes)
const ActionRoutes = require('./routes/ActionRoutes');
const DeviceRoutes = require('./routes/DeviceRoutes');
const SensorDataRoutes = require('./routes/SensorDataRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware bản
app.use(cors());
app.use(express.json());

// Đăng ký các route vào prefix /api
app.use('/api', ActionRoutes(mqttClient, mqttEvents));
app.use('/api', DeviceRoutes());
app.use('/api', SensorDataRoutes(getLastSeen));

// Khởi động Server sau khi đã thông báo với Sequelize
sequelize.authenticate().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend Server đang chạy tại http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Không thể khởi động server do lỗi kết nối DB:', err);
});