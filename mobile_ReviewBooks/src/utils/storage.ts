// Lưu/đọc/xoá JWT token qua AsyncStorage, thay cho session cookie của web
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key đặt đúng như ví dụ mẫu trong slide "10. Data Storage" ("user-token").
const TOKEN_KEY = 'user-token';

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function loadToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
