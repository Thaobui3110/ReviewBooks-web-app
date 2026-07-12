// Chân danh sách báo "đang tải thêm" hoặc "đã hết" khi cuộn vô hạn
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface InfiniteScrollFooterProps {
  loading: boolean;
  hasMore: boolean;
}

export default function InfiniteScrollFooter({ loading, hasMore }: InfiniteScrollFooterProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (!hasMore) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Đã hiển thị tất cả</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.lg, alignItems: 'center' },
  text: { color: colors.textMuted, fontSize: 12 },
});
