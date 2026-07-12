import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookStackParamList } from '../navigation/types';
import { Book, Comment, RatingStats } from '../types';
import * as booksApi from '../api/booksApi';
import { useAuth } from '../context/AuthContext';
import { useAppMessage } from '../context/AppMessageContext';
import StarRatingDisplay from '../components/StarRatingDisplay';
import CommentItem from '../components/CommentItem';
import CommentForm from '../components/CommentForm';
import PrimaryButton from '../components/PrimaryButton';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { API_BASE_URL } from '../api/config';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<BookStackParamList, 'BookDetail'>;

export default function BookDetailScreen({ route, navigation }: Props) {
  const { bookId } = route.params;
  const { user } = useAuth();
  const { showMessage } = useAppMessage();

  const [book, setBook] = useState<Book | null>(null);
  const [rating, setRating] = useState<RatingStats | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, commentData] = await Promise.all([booksApi.getBook(bookId), booksApi.listComments(bookId)]);
      setBook(detail.book);
      setRating(detail.rating);
      setComments(commentData.comments);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    navigation.setOptions({ title: book?.title ?? 'Chi tiết sách' });
  }, [book, navigation]);

  async function handleCreateComment(content: string, ratingValue: number) {
    await booksApi.createComment(bookId, content, ratingValue);
    setShowNewForm(false);
    showMessage('success', 'Đã gửi đánh giá của bạn.');
    await load();
  }

  async function handleUpdateComment(commentId: number, content: string, ratingValue: number) {
    await booksApi.updateComment(bookId, commentId, content, ratingValue);
    setEditingCommentId(null);
    showMessage('success', 'Đã cập nhật bình luận.');
    await load();
  }

  async function handleDeleteComment(commentId: number) {
    await booksApi.deleteComment(bookId, commentId);
    showMessage('success', 'Đã xoá bình luận.');
    await load();
  }

  if (loading || !book) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: `${API_BASE_URL}/images/books/placeholder.png` }} style={styles.cover} />

      <View style={styles.tagsRow}>
        {book.tags.map((tag) => (
          <View key={tag.id} style={styles.tag}>
            <Text style={styles.tagText}>{tag.name}</Text>
          </View>
        ))}
      </View>

      <Text style={typography.h1}>{book.title}</Text>
      <Text style={styles.authorLine}>Tác giả: {book.author}</Text>
      <StarRatingDisplay value={rating?.average_rating ?? 0} count={rating?.total} />

      <Text style={styles.sectionTitle}>Giới thiệu</Text>
      <Text style={typography.body}>{book.description}</Text>

      <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
      <InfoRow label="Ngôn ngữ gốc" value={book.language ?? 'Chưa cập nhật'} />
      <InfoRow label="Năm xuất bản" value={book.publish_year ? String(book.publish_year) : 'Chưa cập nhật'} />
      <InfoRow label="Số trang" value={book.page_count ? `${book.page_count} trang` : 'Chưa cập nhật'} />
      <InfoRow label="Nhà xuất bản" value={book.publisher ?? 'Chưa cập nhật'} />
      {book.translator ? <InfoRow label="Người dịch" value={book.translator} /> : null}

      <Text style={styles.sectionTitle}>Về tác giả</Text>
      <View style={styles.authorCard}>
        <Image source={{ uri: `${API_BASE_URL}${book.author_avatar}` }} style={styles.authorAvatar} />
        <Text style={[typography.body, styles.authorBio]}>
          {book.author_bio ?? 'Chưa có thông tin giới thiệu về tác giả này.'}
        </Text>
      </View>

      {book.review_content ? (
        <>
          <Text style={styles.sectionTitle}>Nhận xét từ đội ngũ ReviewBooks</Text>
          <Text style={typography.body}>{book.review_content}</Text>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Đánh giá và bình luận ({comments.length})</Text>

      {user ? (
        showNewForm ? (
          <CommentForm
            submitLabel="Gửi đánh giá"
            onSubmit={handleCreateComment}
            onCancel={() => setShowNewForm(false)}
          />
        ) : (
          <PrimaryButton
            title="Viết đánh giá của bạn"
            onPress={() => setShowNewForm(true)}
            style={styles.writeButton}
          />
        )
      ) : (
        <Text style={[typography.bodyMuted, styles.loginPrompt]}>Vui lòng đăng nhập để bình luận và đánh giá.</Text>
      )}

      {comments.length === 0 ? (
        <EmptyState text="Chưa có bình luận nào cho sách này. Hãy là người đầu tiên!" />
      ) : (
        comments.map((comment) =>
          editingCommentId === comment.id ? (
            <CommentForm
              key={comment.id}
              initialContent={comment.content}
              initialRating={comment.rating}
              submitLabel="Lưu thay đổi"
              onSubmit={(content, ratingValue) => handleUpdateComment(comment.id, content, ratingValue)}
              onCancel={() => setEditingCommentId(null)}
            />
          ) : (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwn={!!user && String(comment.user_id) === String(user.id)}
              onEdit={() => setEditingCommentId(comment.id)}
              onDelete={() => handleDeleteComment(comment.id)}
            />
          )
        )
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  cover: { width: '100%', height: 220, borderRadius: 8, backgroundColor: colors.surfaceWarm, marginBottom: spacing.md },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  tag: { backgroundColor: colors.accentSoft, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: 4 },
  tagText: { fontSize: 11, color: colors.accentHover, fontWeight: '600' },
  authorLine: { color: colors.textMuted, marginBottom: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { color: colors.textMuted, fontSize: 13 },
  infoValue: { color: colors.text, fontSize: 13, fontWeight: '600' },
  authorCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  authorAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surfaceWarm },
  authorBio: { flex: 1 },
  writeButton: { marginBottom: spacing.lg },
  loginPrompt: { marginBottom: spacing.lg },
});
