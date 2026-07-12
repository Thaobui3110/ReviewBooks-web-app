import React, { useState } from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAppMessage } from '../context/AppMessageContext';
import { validateProfileUsername, validatePasswordChangeInput } from '../utils/validation';
import * as authApi from '../api/authApi';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function AccountScreen() {
  const { user, logout, updateUsername } = useAuth();
  const { showMessage } = useAppMessage();

  const [username, setUsername] = useState(user?.username ?? '');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleSaveProfile() {
    const validationError = validateProfileUsername(username);
    if (validationError) {
      setProfileError(validationError);
      return;
    }
    setProfileError('');
    setProfileLoading(true);
    try {
      await updateUsername(username);
      showMessage('success', 'Đã cập nhật tên hiển thị.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Cập nhật thất bại.');
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword() {
    const validationError = validatePasswordChangeInput(currentPassword, newPassword, confirmPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }
    setPasswordError('');
    setPasswordLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword, confirmPassword });
      showMessage('success', 'Đã đổi mật khẩu thành công.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Đổi mật khẩu thất bại.');
    } finally {
      setPasswordLoading(false);
    }
  }

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.h1}>Tài khoản</Text>

      <TextField label="Vai trò" value={user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'} editable={false} />

      <Text style={[typography.h3, styles.cardTitle]}>Thông tin tài khoản</Text>
      {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
      <TextField label="Tên đăng nhập" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextField label="Email" value={user.email} editable={false} />
      <PrimaryButton title="Lưu thay đổi" onPress={handleSaveProfile} loading={profileLoading} />

      <Text style={[typography.h3, styles.cardTitle]}>Đổi mật khẩu</Text>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      <TextField
        label="Mật khẩu hiện tại"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />
      <TextField label="Mật khẩu mới" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
      <TextField
        label="Xác nhận mật khẩu mới"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <PrimaryButton title="Đổi mật khẩu" onPress={handleChangePassword} loading={passwordLoading} />

      <PrimaryButton title="Đăng xuất" variant="outline" onPress={logout} style={styles.logoutButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  cardTitle: { marginTop: spacing.xl, marginBottom: spacing.md },
  errorText: { color: colors.danger, fontSize: 12, marginBottom: spacing.sm },
  logoutButton: { marginTop: spacing.xxl },
});
