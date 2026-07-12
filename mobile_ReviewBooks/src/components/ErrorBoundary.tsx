import React, { Component, ReactNode } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Error boundary thuần React (class component + componentDidCatch, không dùng
// thư viện) để hiện đúng lỗi ra màn hình thay vì màn hình trắng không rõ nguyên nhân.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Đã xảy ra lỗi</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <Text style={styles.stack}>{this.state.error.stack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.xl, backgroundColor: colors.bg },
  title: { fontSize: 18, fontWeight: '700', color: colors.danger, marginBottom: spacing.md },
  message: { fontSize: 14, color: colors.text, marginBottom: spacing.lg },
  stack: { fontSize: 11, color: colors.textMuted },
});
