// Thông báo "không có dữ liệu" dùng chung cho các danh sách
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xxl, alignItems: 'center' },
  text: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
});
