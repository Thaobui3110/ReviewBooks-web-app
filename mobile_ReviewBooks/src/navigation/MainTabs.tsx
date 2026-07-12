// Tab Navigator chính: Trang chủ, Sách, Đánh giá, Liên hệ, Tài khoản
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import BookStack from './BookStack';
import ReviewsFeedScreen from '../screens/ReviewsFeedScreen';
import ContactScreen from '../screens/ContactScreen';
import AccountScreen from '../screens/AccountScreen';
import CustomTabBar from './CustomTabBar';
import { MainTabParamList } from './types';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="Books" component={BookStack} options={{ headerShown: false, title: 'Sách' }} />
      <Tab.Screen name="Reviews" component={ReviewsFeedScreen} options={{ title: 'Đánh giá' }} />
      <Tab.Screen name="Contact" component={ContactScreen} options={{ title: 'Liên hệ' }} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ title: 'Tài khoản' }} />
    </Tab.Navigator>
  );
}
