const express = require('express');
const cors = require('cors');
const path = require('path'); // THÊM DÒNG NÀY (Thư viện có sẵn của Node.js)
const sequelize = require('./config/Database');
const { mqttClient, mqttEvents, getLastSeen } = require('./config/Mqtt');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Nạp các Router chuyên biệt (Modular Routes)
const ActionRoutes = require('./routes/ActionRoutes');
const DeviceRoutes = require('./routes/DeviceRoutes');
const SensorDataRoutes = require('./routes/SensorDataRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. ĐƯA MIDDLEWARE CƠ BẢN LÊN TRƯỚC
// Phải để CORS và json parser ở trên cùng để nó áp dụng cho mọi request phía dưới
app.use(cors());
app.use(express.json());

// 2. KHAI BÁO SWAGGER VỚI ĐƯỜNG DẪN TUYỆT ĐỐI
// Dùng path.join(__dirname, ...) giúp Nodejs luôn tìm đúng file yaml nằm cùng thư mục với server.js
const swaggerPath = path.join(__dirname, 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);
// Đăng ký route Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 3. ĐĂNG KÝ CÁC ROUTE API CỦA BẠN
app.use('/api', ActionRoutes(mqttClient, mqttEvents));
app.use('/api', DeviceRoutes());
app.use('/api', SensorDataRoutes(getLastSeen));

// Khởi động Server...
sequelize.authenticate().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend Server đang chạy tại http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Không thể khởi động server do lỗi kết nối DB:', err);
});