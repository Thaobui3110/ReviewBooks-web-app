import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppMessage } from '../context/AppMessageContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function Banner() {
  const { message, clearMessage } = useAppMessage();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(clearMessage, 3000);
    return () => clearTimeout(timer);
  }, [message, clearMessage]);

  if (!message) return null;

  const isError = message.type === 'error';
  return (
    <View style={[styles.banner, isError ? styles.error : styles.success]}>
      <Text style={isError ? styles.errorText : styles.successText}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  success: { backgroundColor: colors.successSoft },
  error: { backgroundColor: colors.dangerSoft },
  successText: { color: colors.success, fontSize: 13, fontWeight: '600' },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
});
