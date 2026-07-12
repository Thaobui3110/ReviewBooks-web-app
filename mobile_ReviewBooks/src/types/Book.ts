export interface Tag {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  author_id: number;
  author: string;
  author_avatar: string;
  author_bio?: string | null;
  cover_image: string;
  description: string;
  review_content: string | null;
  language: string | null;
  publish_year: number | null;
  page_count: number | null;
  publisher: string | null;
  translator: string | null;
  created_at: string;
  updated_at: string;
  average_rating?: number;
  comment_count?: number;
  tags: Tag[];
}

export interface RatingStats {
  average_rating: number;
  total: number;
}
