import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Palette } from '@/constants/Colors';
import {
  TrainingCategory,
  trainingCategories,
  trainingCategoryMeta,
} from '@/constants/training';

type CategorySegmentProps = {
  value: TrainingCategory;
  onChange: (category: TrainingCategory) => void;
  style?: ViewStyle;
};

/** 種目カテゴリを切り替えるセグメントコントロール */
export default function CategorySegment({
  value,
  onChange,
  style,
}: CategorySegmentProps) {
  return (
    <View style={[styles.container, style]} accessibilityRole="tablist">
      {trainingCategories.map((category) => {
        const isActive = category === value;
        return (
          <Pressable
            key={category}
            style={[styles.segment, isActive && styles.activeSegment]}
            onPress={() => onChange(category)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[styles.segmentText, isActive && styles.activeSegmentText]}
            >
              {trainingCategoryMeta[category].label}
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
