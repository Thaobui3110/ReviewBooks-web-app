// Trang đăng nhập
import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/validation';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const validationError = validateLogin(username, password);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typography.h1}>Đăng nhập</Text>
      <Text style={[typography.bodyMuted, styles.subtitle]}>
        Đăng nhập để bình luận, đánh giá và quản lý tài khoản của bạn.
      </Text>

      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      <TextField label="Tên đăng nhập" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextField label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />

      <PrimaryButton title="Đăng nhập" onPress={handleSubmit} loading={loading} />

      <Text style={styles.switchText}>
        Chưa có tài khoản?{' '}
        <Text style={styles.switchLink} onPress={() => navigation.navigate('Register')}>
          Đăng ký ngay
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.xxl, backgroundColor: colors.bg },
  subtitle: { textAlign: 'center', marginBottom: spacing.xxl },
  errorBanner: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  switchText: { textAlign: 'center', marginTop: spacing.xl, color: colors.textMuted },
  switchLink: { color: colors.accent, fontWeight: '700' },
});
