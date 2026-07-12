import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface StarRatingDisplayProps {
  value: number;
  count?: number;
}

export default function StarRatingDisplay({ value, count }: StarRatingDisplayProps) {
  const rounded = Math.round(value);
  return (
    <View style={styles.row}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Text key={i} style={[styles.star, { color: i <= rounded ? colors.star : colors.starEmpty }]}>
            ★
          </Text>
        ))}
      </View>
      <Text style={styles.value}>{value.toFixed(1)}</Text>
      {typeof count === 'number' ? <Text style={styles.count}>({count})</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  stars: { flexDirection: 'row', marginRight: 6 },
  star: { fontSize: 16, marginRight: 1 },
  value: { fontSize: 13, fontWeight: '700', color: colors.textSoft, marginRight: 4 },
  count: { fontSize: 12, color: colors.textMuted },
});
