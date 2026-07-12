import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const TAB_LABELS: Record<string, string> = {
  Home: 'Trang chủ',
  Books: 'Sách',
  Reviews: 'Đánh giá',
  Contact: 'Liên hệ',
  Account: 'Tài khoản',
};

// Tự vẽ thanh tab bằng View/Text/Pressable thuần, không dùng BottomTabBar dựng
// sẵn của React Navigation — chỉ hiện chữ, tô màu nền cho tab đang chọn, mô
// phỏng theo thanh nav của website (public/css/layout.css .main-nav).
export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = TAB_LABELS[route.name] ?? route.name;

        function handlePress() {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        }

        return (
          <Pressable key={route.key} onPress={handlePress} style={[styles.item, focused && styles.itemActive]}>
            <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#32352F',
    paddingHorizontal: 6,
    paddingTop: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  itemActive: { backgroundColor: colors.accent },
  label: { fontSize: 12, fontWeight: '700', color: 'rgba(251, 248, 240, 0.78)' },
  labelActive: { color: '#fff' },
});
