// Trang gửi ý kiến liên hệ
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAppMessage } from '../context/AppMessageContext';
import { validateContactInput } from '../utils/validation';
import * as contactApi from '../api/contactApi';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function ContactScreen() {
  const { user } = useAuth();
  const { showMessage } = useAppMessage();
  const [name, setName] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const validationError = validateContactInput(name, email, message);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await contactApi.submitContact({ name, email, subject: subject || undefined, message });
      showMessage('success', 'Cảm ơn bạn đã gửi ý kiến! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      setMessage('');
      setSubject('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi ý kiến thất bại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.h1}>Giới thiệu & Liên hệ</Text>

      <View style={styles.infoCard}>
        <Text style={typography.h3}>Về ReviewBooks</Text>
        <Text style={[typography.bodyMuted, styles.infoText]}>
          ReviewBooks là dự án bài tập lớn môn Lập trình Web và Ứng dụng Di động, xây dựng một không gian để độc
          giả khám phá sách hay và chia sẻ cảm nhận thật của mình.
        </Text>
        <InfoLine label="Email" value="contact@reviewbooks.local" />
        <InfoLine label="Điện thoại" value="0123 456 789" />
        <InfoLine label="Địa chỉ" value="Đại học Bách Khoa Hà Nội, Số 1 Đại Cồ Việt, Hà Nội" />
      </View>

      <Text style={[typography.h3, styles.formTitle]}>Gửi ý kiến của bạn</Text>

      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      <TextField label="Họ tên" value={name} onChangeText={setName} />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextField label="Tiêu đề" value={subject} onChangeText={setSubject} placeholder="Góp ý website" />
      <TextField label="Nội dung" value={message} onChangeText={setMessage} multiline numberOfLines={4} />

      <PrimaryButton title="Gửi ý kiến" onPress={handleSubmit} loading={loading} />
    </ScrollView>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },
  infoText: { marginTop: spacing.xs, marginBottom: spacing.md },
  infoLine: { marginTop: spacing.sm },
  infoLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: 14, color: colors.text },
  formTitle: { marginBottom: spacing.md },
  errorBanner: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
});
