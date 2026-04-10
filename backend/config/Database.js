const { Sequelize } = require('sequelize');
require('dotenv').config();

// Cấu hình kết nối MySQL bằng Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME || 'smart_home_iot',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '1234',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 205,
        dialect: 'mysql',
        logging: false, // Tắt log truy vấn SQL thô trong console
        define: {
            timestamps: false, // Mặc định không dùng createdAt/updatedAt cho các bảng hiện có
            freezeTableName: true // Giữ nguyên tên bảng
        }
    }
);

// Kiểm tra kết nối
sequelize.authenticate()
    .then(() => console.log('Đã kết nối MySQL qua Sequelize!'))
    .catch(err => console.error('Lỗi kết nối Sequelize:', err));

module.exports = sequelize;
