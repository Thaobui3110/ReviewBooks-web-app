import React from 'react';
import { Text, Image, Pressable, StyleSheet } from 'react-native';
import { Book } from '../types';
import StarRatingDisplay from './StarRatingDisplay';
import { API_BASE_URL } from '../api/config';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface BookCardProps {
  book: Book;
  onPress: () => void;
}

export default function BookCard({ book, onPress }: BookCardProps) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <Image source={{ uri: `${API_BASE_URL}${book.cover_image}` }} style={styles.cover} resizeMode="contain" />
      <Text style={styles.title} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {book.author}
      </Text>
      <StarRatingDisplay value={book.average_rating ?? 0} count={book.comment_count} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.sm,
    margin: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  cover: { width: '100%', height: 180, borderRadius: 8, backgroundColor: colors.surfaceWarm },
  title: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  author: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: spacing.xs },
});
