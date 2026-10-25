import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ReactNode, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import NumberStepper from '@/components/NumberStepper';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette, Shadow } from '@/constants/Colors';
import { SetEntry } from '@/constants/training';
import {
  SETS_MAX,
  parseNumberInput,
  parseWeightInput,
  validateSetInputs,
} from '@/helper/validation';

/** 重量の −/＋ の刻み（プレートの最小単位の 1.25kg × 2） */
const WEIGHT_STEP = 2.5;

/** 入力中の1セット分。数値も入力途中の文字列として持ち、保存時に変換・検証する */
type SetRow = { key: number; weight: string; reps: string };

// 行の追加・削除で React の key がずれないよう、行ごとに一意な番号を振る
let nextRowKey = 0;
const toRow = (entry: { weight: string | number; reps: string | number }) => ({
  key: nextRowKey++,
  weight: String(entry.weight),
  reps: String(entry.reps),
});

type SetsFormProps = {
  /** 初期値（1セット以上） */
  initialSets: SetEntry[];
  submitLabel: string;
  /** 保存処理。失敗時は例外を投げる（フォーム側でエラーを表示する） */
  onSubmit: (sets: SetEntry[]) => Promise<void> | void;
  /** 保存に失敗したときのメッセージ */
  errorMessage: string;
  /** 入力欄の上に置く要素（種目名など） */
  header?: ReactNode;
  /** 保存ボタンの下に置く要素（削除ボタンなど） */
  footer?: ReactNode;
};

/**
 * セットごとの重量・回数の入力フォーム（記録の追加・編集で共通）。
 * 例: 1セット目 10kg × 3回、2セット目 8kg × 2回
 */
export default function SetsForm({
  initialSets,
  submitLabel,
  onSubmit,
  errorMessage,
  header,
  footer,
}: SetsFormProps) {
  const [rows, setRows] = useState<SetRow[]>(() =>
    (initialSets.length > 0 ? initialSets : [{ weight: 0, reps: 10 }]).map(
      toRow,
    ),
  );
  const [saving, setSaving] = useState(false);

  const updateRow = (key: number, patch: Partial<Omit<SetRow, 'key'>>) =>
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );

  // 同じ重量・回数で繰り返すことが多いため、直前のセットの値で追加する
  const addRow = () =>
    setRows((prev) => [
      ...prev,
      toRow(prev[prev.length - 1] ?? { weight: '', reps: '10' }),
    ]);

  const removeRow = (key: number) =>
    setRows((prev) => prev.filter((r) => r.key !== key));

  const save = async () => {
    const error = validateSetInputs(rows);
    if (error) {
      Alert.alert('入力内容を確認してください', error);
      return;
    }

    setSaving(true);
    try {
      await onSubmit(
        rows.map((r) => ({
          weight: parseWeightInput(r.weight),
          reps: parseNumberInput(r.reps),
        })),
      );
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

        {rows.map((row, i) => (
          <View key={row.key} style={styles.setCard}>
            <View style={styles.setHeader}>
              <Text style={styles.setTitle}>{`${i + 1}セット目`}</Text>
              {/* 最後の1セットは消せない */}
              {rows.length > 1 && (
                <Pressable
                  onPress={() => removeRow(row.key)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`${i + 1}セット目を削除`}
                >
                  {({ pressed }) => (
                    <FontAwesome
                      name="trash-o"
                      size={16}
                      color={Palette.iconInactive}
                      style={pressed && styles.pressed}
                    />
                  )}
                </Pressable>
              )}
            </View>
            <View style={styles.steppers}>
              <NumberStepper
                label="重量（kg）"
                value={row.weight}
                onChange={(weight) => updateRow(row.key, { weight })}
                step={WEIGHT_STEP}
                min={0}
                decimal
                compact
              />
              <NumberStepper
                label="回数"
                value={row.reps}
                onChange={(reps) => updateRow(row.key, { reps })}
                step={1}
                min={1}
                compact
              />
            </View>
          </View>
        ))}

        {rows.length < SETS_MAX && (
          <Pressable
            onPress={addRow}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
          >
            <FontAwesome name="plus" size={12} color={Palette.primary} />
            <Text style={styles.addText}>セットを追加</Text>
          </Pressable>
        )}

        <Text style={styles.hint}>
          自重の種目は重量を 0
          にしてください。セットを追加すると、直前のセットと同じ値が入ります。
        </Text>
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
    gap: 12,
  },
  setCard: {
    backgroundColor: Palette.surface,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    ...Shadow.card,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.text,
  },
  steppers: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addText: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.primary,
  },
  pressed: {
    opacity: 0.6,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    color: Palette.textMuted,
  },
});
