import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppMessageProvider } from './src/context/AppMessageContext';
import Banner from './src/components/Banner';
import ErrorBoundary from './src/components/ErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppMessageProvider>
          <AuthProvider>
            <Banner />
            <RootNavigator />
            <StatusBar style="auto" />
          </AuthProvider>
        </AppMessageProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
