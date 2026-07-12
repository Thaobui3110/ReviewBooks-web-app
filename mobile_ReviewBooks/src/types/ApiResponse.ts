// Kiểu response chung của API: { success, data, message }
export type ApiResponse<T = undefined> =
  | { success: true; data: T }
  | { success: false; message: string };
