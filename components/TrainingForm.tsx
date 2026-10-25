import { ReactNode, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import CategorySegment from '@/components/CategorySegment';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/Colors';
import { TrainingCategory, TrainingInput } from '@/constants/training';

const NAME_MAX_LENGTH = 30;

/** 入力値を数値に変換する（全角数字も受け付ける）。数値でなければ NaN */
const toNumber = (text: string) =>
  text.trim() === ''
    ? NaN
    : Number(
        text
          .trim()
          .replace(/[０-９．]/g, (c) =>
            String.fromCharCode(c.charCodeAt(0) - 0xfee0),
          ),
      );

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

type TrainingFormProps = {
  /** 初期値（編集時）。省略時は新規の初期値 */
  initialValues?: TrainingInput;
  submitLabel: string;
  /** 重複を禁止する種目名（編集時は自分自身を除いておく） */
  existingNames: string[];
  /** 保存処理。失敗時は例外を投げる（フォーム側でエラーを表示する） */
  onSubmit: (input: TrainingInput) => Promise<void>;
  /** 保存に失敗したときのメッセージ */
  errorMessage: string;
  /** 保存ボタンの下に置く要素（削除ボタンなど） */
  footer?: ReactNode;
};

/**
 * 種目の入力フォーム（追加・編集画面で共通）。
 * 名前・カテゴリ・デフォルトの重量/回数/セット数を入力し、検証してから onSubmit を呼ぶ。
 */
export default function TrainingForm({
  initialValues,
  submitLabel,
  existingNames,
  onSubmit,
  errorMessage,
  footer,
}: TrainingFormProps) {
  // 数値も入力途中の文字列として持ち、保存時に変換・検証する
  const [name, setName] = useState(initialValues?.name ?? '');
  const [category, setCategory] = useState<TrainingCategory>(
    initialValues?.category ?? 'freeWeights',
  );
  const [weight, setWeight] = useState(
    initialValues?.defaultWeight ? String(initialValues.defaultWeight) : '',
  );
  const [reps, setReps] = useState(String(initialValues?.defaultReps ?? 10));
  const [sets, setSets] = useState(String(initialValues?.defaultSets ?? 3));
  const [saving, setSaving] = useState(false);

  /** 入力のエラー（問題なければ null）。保存時に表示する */
  const validate = (): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return '種目名を入力してください。';
    if (trimmed.length > NAME_MAX_LENGTH) {
      return `種目名は${NAME_MAX_LENGTH}文字以内で入力してください。`;
    }
    if (existingNames.includes(trimmed)) {
      return '同じ名前の種目がすでにあります。';
    }
    // 重量は空欄なら 0（自重）として扱う
    const w = weight.trim() === '' ? 0 : toNumber(weight);
    if (!Number.isFinite(w) || w < 0 || w > 1000) {
      return '重量は 0〜1000 kg の数値で入力してください。';
    }
    const r = toNumber(reps);
    if (!Number.isInteger(r) || r < 1 || r > 1000) {
      return '回数は 1 以上の整数で入力してください。';
    }
    const s = toNumber(sets);
    if (!Number.isInteger(s) || s < 1 || s > 100) {
      return 'セット数は 1〜100 の整数で入力してください。';
    }
    return null;
  };

  const save = async () => {
    const error = validate();
    if (error) {
      Alert.alert('入力内容を確認してください', error);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        category,
        defaultWeight: weight.trim() === '' ? 0 : toNumber(weight),
        defaultReps: toNumber(reps),
        defaultSets: toNumber(sets),
      });
    } catch (e) {
      console.error('Failed to save training:', e);
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
        <Field label="種目名">
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="例: ブルガリアンスクワット"
            placeholderTextColor={Palette.textDisabled}
            maxLength={NAME_MAX_LENGTH}
            returnKeyType="done"
          />
        </Field>

        <Field label="カテゴリ">
          <CategorySegment value={category} onChange={setCategory} />
        </Field>

        <Field
          label="重量（kg）"
          hint="自重の種目は空欄（または 0）にしてください"
        >
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="0"
            placeholderTextColor={Palette.textDisabled}
            keyboardType="decimal-pad"
          />
        </Field>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Field label="回数">
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={setReps}
                keyboardType="number-pad"
              />
            </Field>
          </View>
          <View style={styles.rowItem}>
            <Field label="セット数">
              <TextInput
                style={styles.input}
                value={sets}
                onChangeText={setSets}
                keyboardType="number-pad"
              />
            </Field>
          </View>
        </View>

        <Text style={styles.note}>
          重量・回数・セット数は、記録するときの初期値になります。
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
    backgroundColor: Palette.bg,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Palette.textMuted,
  },
  hint: {
    fontSize: 11,
    color: Palette.textMuted,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    fontSize: 16,
    color: Palette.text,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: Palette.textMuted,
  },
});
