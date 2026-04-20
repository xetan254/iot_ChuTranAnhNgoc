const { SensorData, Action, Device } = require('../models');

// Dịch vụ xử lý Logic cho MQTT (Incoming Messages)
const MqttService = {
    handleMessage: async (topic, message, mqttClient, mqttEvents, updateLastSeen) => {
        // Mỗi khi có tin tức từ ESP32 -> Cập nhật lại thời gian Online
        updateLastSeen(Date.now());

        const payload = message.toString();

        // 1. Nhận dữ liệu cảm biến
        if (topic === 'data_sensor') {
            try {
                const data = JSON.parse(payload);
                // Dùng Sequelize bulkCreate để tối ưu chèn nhiều dòng cùng lúc
                SensorData.bulkCreate([
                    { sensor_id: 1, type: 'Nhiệt độ', value: data.temperature },
                    { sensor_id: 1, type: 'Độ ẩm', value: data.humidity },
                    { sensor_id: 3, type: 'Ánh sáng', value: data.lux },
                    { sensor_id: 4, type: 'Không khí', value: data.gas_ppm }
                ]).catch(err => console.error('Lỗi lưu sensor_data:', err));
            } catch (err) {
                console.error('Lỗi định dạng JSON topic data_sensor:', err);
            }
        }

        // 2. Nhận phản hồi (Feedback) trạng thái từ thiết bị
        if (topic === 'status') {
            try {
                const feedback = JSON.parse(payload);
                // Phát sự kiện để controller/controlDevice biết lệnh đã thành công
                mqttEvents.emit(`feedback_${feedback.device}`, feedback.status);

                // Cập nhật lại bảng lịch sử (Status 'waiting' -> 'ON'/'OFF')
                let deviceId = feedback.device === 'LED_1' ? 1 : (feedback.device === 'LED_2' ? 2 : (feedback.device === 'LED_3' ? 3 : (feedback.device === 'LED_4' ? 4 : 5)));
                
                // Tìm hành động 'waiting' gần nhất để cập nhật trạng thái thực tế
                const lastWaitingAction = await Action.findOne({
                    where: { device_id: deviceId, status: 'waiting' },
                    order: [['id', 'DESC']]
                });

                if (lastWaitingAction) {
                    await lastWaitingAction.update({ status: feedback.status.toUpperCase() });
                    console.log(`Cập nhật trạng thái thực tế: ${feedback.device} -> ${feedback.status}`);
                }
            } catch (err) {
                console.error('Lỗi định dạng JSON topic status:', err);
            }
        }

        // 3. Yêu cầu đồng bộ trạng thái khi ESP32 khởi động lại
        if (topic === 'request_sync') {
            console.log("ESP32 yêu cầu đồng bộ. Đang tìm trạng thái hợp lệ gần nhất...");
            
            // Xử lý lệch nhịp 1 chút để ESP32 ổn định wifi
            setTimeout(async () => {
                const deviceList = [
                    { id: 1, code: 'LED_1' }, 
                    { id: 2, code: 'LED_2' }, 
                    { id: 3, code: 'LED_3' },
                    { id: 4, code: 'LED_4' },
                    { id: 5, code: 'LED_5' },
                ];
                
                for (const dev of deviceList) {
                    const lastValidAction = await Action.findOne({
                        where: { device_id: dev.id, status: ['ON', 'OFF', 'on', 'off'] },
                        order: [['id', 'DESC']]
                    });

                    if (lastValidAction) {
                        const actionText = lastValidAction.action.toUpperCase();
                        mqttClient.publish('control', JSON.stringify({ 
                            device: dev.code, 
                            action: actionText 
                        }));
                    }
                }
            }, 1500);
        }
    }
};

module.exports = MqttService;
