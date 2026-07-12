export interface Comment {
  id: number;
  book_id: number;
  user_id: number | null;
  username: string | null;
  name: string;
  email: string;
  content: string;
  rating: number;
  created_at: string;
}
