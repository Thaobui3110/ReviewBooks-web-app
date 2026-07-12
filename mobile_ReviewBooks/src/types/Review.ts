// Kiểu dữ liệu đánh giá dùng ở trang "Tất cả đánh giá"
export interface Review {
  id: number;
  book_id: number;
  book_title: string;
  book_author: string;
  book_cover_image: string;
  user_id: number | null;
  username: string | null;
  name: string;
  email: string;
  content: string;
  rating: number;
  created_at: string;
}
