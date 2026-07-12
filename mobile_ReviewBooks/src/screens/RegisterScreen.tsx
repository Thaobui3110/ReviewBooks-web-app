import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { useAppMessage } from '../context/AppMessageContext';
import { validateRegister } from '../utils/validation';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const { showMessage } = useAppMessage();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const validationError = validateRegister(username, email, password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(username, email, password, confirmPassword);
      showMessage('success', 'Đăng ký thành công! Hãy đăng nhập.');
      navigation.navigate('Login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typography.h1}>Đăng ký</Text>
      <Text style={[typography.bodyMuted, styles.subtitle]}>
        Tạo tài khoản để lưu lại các đánh giá sách của bạn.
      </Text>

      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      <TextField label="Tên đăng nhập" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextField label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
      <TextField
        label="Xác nhận mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <PrimaryButton title="Đăng ký" onPress={handleSubmit} loading={loading} />

      <Text style={styles.switchText}>
        Đã có tài khoản?{' '}
        <Text style={styles.switchLink} onPress={() => navigation.navigate('Login')}>
          Đăng nhập
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
