import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Comment } from '../types';
import StarRatingDisplay from './StarRatingDisplay';
import { formatDate } from '../utils/formatDate';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface CommentItemProps {
  comment: Comment;
  isOwn: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CommentItem({ comment, isOwn, onEdit, onDelete }: CommentItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headRow}>
        <Text style={styles.name}>{comment.username ?? comment.name}</Text>
        <StarRatingDisplay value={comment.rating} showValue={false} />
      </View>
      <Text style={styles.date}>{formatDate(comment.created_at)}</Text>
      <Text style={styles.content}>{comment.content}</Text>
      {isOwn ? (
        <View style={styles.actions}>
          <Pressable onPress={onEdit}>
            <Text style={styles.actionText}>Chỉnh sửa</Text>
          </Pressable>
          <Pressable onPress={onDelete}>
            <Text style={[styles.actionText, styles.danger]}>Xoá</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '700', color: colors.text, fontSize: 13 },
  date: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  content: { fontSize: 14, color: colors.text, marginTop: spacing.xs },
  actions: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.lg },
  actionText: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  danger: { color: colors.danger },
});
