// Form gửi/sửa bình luận kèm chọn sao đánh giá
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import StarRatingInput from './StarRatingInput';
import PrimaryButton from './PrimaryButton';
import { validateCommentInput } from '../utils/validation';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface CommentFormProps {
  initialContent?: string;
  initialRating?: number;
  submitLabel: string;
  onSubmit: (content: string, rating: number) => Promise<void>;
  onCancel?: () => void;
}

export default function CommentForm({
  initialContent = '',
  initialRating = 5,
  submitLabel,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);
  const [rating, setRating] = useState(initialRating);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const validationError = validateCommentInput(content, rating);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit(content, rating);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Điểm đánh giá</Text>
      <StarRatingInput value={rating} onChange={setRating} />

      <Text style={[styles.label, { marginTop: spacing.md }]}>Nội dung bình luận</Text>
      <TextInput
        style={styles.textarea}
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
        placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
        placeholderTextColor={colors.textMuted}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        {onCancel ? (
          <PrimaryButton title="Hủy" variant="outline" onPress={onCancel} style={styles.actionBtn} />
        ) : null}
        <PrimaryButton title={submitLabel} onPress={handleSubmit} loading={loading} style={styles.actionBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSoft, marginBottom: spacing.xs },
  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  error: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  actionBtn: { flex: 1 },
});
