import { ViewStyle } from 'react-native';
import SegmentedControl from '@/components/SegmentedControl';
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

const options = trainingCategories.map((category) => ({
  value: category,
  label: trainingCategoryMeta[category].label,
}));

/** 種目カテゴリを切り替えるセグメントコントロール */
export default function CategorySegment({
  value,
  onChange,
  style,
}: CategorySegmentProps) {
  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={onChange}
      style={style}
    />
  );
}
