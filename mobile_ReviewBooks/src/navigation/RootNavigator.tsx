// Rẽ nhánh: chưa đăng nhập → AuthStack, đã đăng nhập → MainTabs
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <NavigationContainer>{user ? <MainTabs /> : <AuthStack />}</NavigationContainer>;
}
