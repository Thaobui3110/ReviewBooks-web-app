// Địa chỉ backend theo nền tảng — sửa NATIVE_HOST khi đổi môi trường test
import { Platform } from 'react-native';

const PORT = 3001;

// Sửa giá trị này khi đổi môi trường test:
// - Android Emulator: đổi thành '10.0.2.2' (trỏ về localhost của máy host)
// - Điện thoại thật qua Expo Go: địa chỉ IP LAN của máy tính đang chạy backend,
//   cùng mạng Wi-Fi với điện thoại (lấy bằng `ipconfig`, dòng "IPv4 Address")
const NATIVE_HOST = '192.168.0.104';

export const API_BASE_URL =
  Platform.OS === 'web' ? `http://localhost:${PORT}` : `http://${NATIVE_HOST}:${PORT}`;
