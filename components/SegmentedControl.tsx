import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Palette } from '@/constants/Colors';

type SegmentedControlProps<T extends string> = {
  /** 選択肢（並び順のとおりに表示する） */
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
};

/** 選択肢を切り替えるセグメントコントロール（カテゴリ、グラフの指標など） */
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  return (
    <View style={[styles.container, style]} accessibilityRole="tablist">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.segment, isActive && styles.activeSegment]}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[styles.segmentText, isActive && styles.activeSegmentText]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 3,
    padding: 3,
    borderRadius: 10,
    backgroundColor: Palette.surfaceMuted,
  },
  segment: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSegment: {
    backgroundColor: Palette.surface,
    shadowColor: Palette.text,
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.textMuted,
  },
  activeSegmentText: {
    fontWeight: '700',
    color: Palette.text,
  },
});
