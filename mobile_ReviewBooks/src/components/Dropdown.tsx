// Dropdown tự viết bằng Modal + FlatList, dùng cho lọc thể loại/sắp xếp
import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

export default function Dropdown({ value, options, onSelect, style }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Pressable style={[styles.trigger, style]} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText} numberOfLines={1}>
          {selected?.label ?? ''}
        </Text>
        <Text style={styles.caret}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.menu} onPress={() => {}}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.option, item.value === value && styles.optionActive]}
                  onPress={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, item.value === value && styles.optionTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  triggerText: { fontSize: 13, color: colors.text, flexShrink: 1, marginRight: spacing.xs },
  caret: { color: colors.textMuted, fontSize: 12 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(29, 33, 27, 0.4)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    maxHeight: 360,
    overflow: 'hidden',
  },
  option: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  optionActive: { backgroundColor: colors.accentSoft },
  optionText: { fontSize: 14, color: colors.text },
  optionTextActive: { color: colors.accentHover, fontWeight: '700' },
});
