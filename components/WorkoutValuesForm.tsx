import { ReactNode, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import NumberStepper from '@/components/NumberStepper';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/Colors';
import { WorkoutValues } from '@/constants/training';
import {
  parseNumberInput,
  parseWeightInput,
  validateWorkoutValues,
} from '@/helper/validation';

/** 重量の −/＋ の刻み（プレートの最小単位の 1.25kg × 2） */
const WEIGHT_STEP = 2.5;

type WorkoutValuesFormProps = {
  initialValues: WorkoutValues;
  submitLabel: string;
  /** 保存処理。失敗時は例外を投げる（フォーム側でエラーを表示する） */
  onSubmit: (values: WorkoutValues) => Promise<void> | void;
  /** 保存に失敗したときのメッセージ */
  errorMessage: string;
  /** 入力欄の上に置く要素（種目名など） */
  header?: ReactNode;
  /** 保存ボタンの下に置く要素（削除ボタンなど） */
  footer?: ReactNode;
};

/**
 * 記録の重量・回数・セット数の入力フォーム（記録の追加・編集で共通）。
 */
export default function WorkoutValuesForm({
  initialValues,
  submitLabel,
  onSubmit,
  errorMessage,
  header,
  footer,
}: WorkoutValuesFormProps) {
  // 数値も入力途中の文字列として持ち、保存時に変換・検証する
  const [weight, setWeight] = useState(String(initialValues.weight));
  const [reps, setReps] = useState(String(initialValues.reps));
  const [sets, setSets] = useState(String(initialValues.sets));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const error = validateWorkoutValues(weight, reps, sets);
    if (error) {
      Alert.alert('入力内容を確認してください', error);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        weight: parseWeightInput(weight),
        reps: parseNumberInput(reps),
        sets: parseNumberInput(sets),
      });
    } catch (e) {
      console.error('Failed to save workout log:', e);
      Alert.alert('エラー', errorMessage);
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {header}
        <NumberStepper
          label="重量"
          value={weight}
          onChange={setWeight}
          step={WEIGHT_STEP}
          min={0}
          unit="kg"
          decimal
        />
        <NumberStepper
          label="回数"
          value={reps}
          onChange={setReps}
          step={1}
          min={1}
          unit="reps"
        />
        <NumberStepper
          label="セット数"
          value={sets}
          onChange={setSets}
          step={1}
          min={1}
          unit="sets"
        />
        <Text style={styles.hint}>自重の種目は重量を 0 にしてください。</Text>
        <PrimaryButton label={submitLabel} onPress={save} loading={saving} />
        {footer}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 18,
  },
  hint: {
    fontSize: 12,
    color: Palette.textMuted,
  },
});
