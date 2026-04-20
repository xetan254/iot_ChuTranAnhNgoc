const express = require('express');
const cors = require('cors');
const path = require('path'); // THÊM DÒNG NÀY (Thư viện có sẵn của Node.js)
const sequelize = require('./config/Database');
const { mqttClient, mqttEvents, getLastSeen } = require('./config/Mqtt');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const ActionController = require('./controllers/ActionController');
const SensorController = require('./controllers/SensorController');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. ĐƯA MIDDLEWARE CƠ BẢN LÊN TRƯỚC
app.use(cors());
app.use(express.json());

// 2. KHAI BÁO SWAGGER (CÓ BẮT LỖI)
const swaggerPath = path.join(__dirname, 'swagger.yaml');
console.log("-----------------------------------------");
console.log("🔍 Đang tìm file YAML tại đường dẫn:", swaggerPath);

let swaggerDocument;
try {
    swaggerDocument = YAML.load(swaggerPath);
    
    // Kiểm tra xem file có bị rỗng hoặc lỗi parse không
    if (!swaggerDocument || Object.keys(swaggerDocument).length === 0) {
        throw new Error("File YAML được tìm thấy nhưng bị trống hoặc sai cú pháp nghiêm trọng!");
    }
    console.log("✅ Đã load thành công dữ liệu từ swagger.yaml!");

} catch (error) {
    console.log("❌ CẢNH BÁO: KHÔNG ĐỌC ĐƯỢC FILE YAML!");
    console.log("Chi tiết lỗi:", error.message);
    
    // TẠO DỮ LIỆU GIẢ ĐỂ CHỐNG SẬP SERVER
    console.log("⚠️ Đang tự động chuyển sang giao diện Swagger mặc định để test hệ thống...");
    swaggerDocument = {
        openapi: "3.0.0",
        info: {
            title: "HỆ THỐNG ĐANG BỊ LỖI FILE YAML",
            description: "Nếu bạn nhìn thấy dòng này, nghĩa là code Node.js bình thường, nhưng file swagger.yaml của bạn đang bị lỗi.",
            version: "Error"
        },
        paths: {}
    };
}
console.log("-----------------------------------------");

// Đăng ký route Swagger
// CÁCH MỚI: Tách rời việc phục vụ file tĩnh và render UI
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument));

// Đăng ký các API chính cho frontend
app.get('/api/device-status', ActionController.getDeviceStatus);
app.get('/api/sensor-data', SensorController.getSensorData);
app.get('/api/chart-data', SensorController.getChartData);
app.get('/api/action-history', ActionController.getActionHistory);
app.get('/api/sensors', SensorController.getAllSensors); 
app.get('/api/devices', ActionController.getAllDevices);
app.post('/api/control', (req, res) =>
    ActionController.controlDevice(req, res, mqttClient, mqttEvents)
);
app.get('/api/health', (req, res) =>
    SensorController.getHealth(req, res, getLastSeen())
);
app.get('/api/actions/stats/daily', ActionController.getDailyStats);
app.get('/ping', (req, res) => {
    res.send("✅ SERVER BACKEND ĐANG CHẠY RẤT TỐT NHÉ!");
});
// Khởi động Server...
sequelize.authenticate().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend Server đang chạy tại http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Không thể khởi động server do lỗi kết nối DB:', err);
});