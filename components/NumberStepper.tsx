import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Palette } from '@/constants/Colors';
import { parseNumberInput } from '@/helper/validation';

type NumberStepperProps = {
  label: string;
  /** 入力中の文字列（数値への変換と検証は呼び出し側で行う） */
  value: string;
  onChange: (value: string) => void;
  /** −/＋ で増減する量 */
  step: number;
  /** −で下回らない値 */
  min: number;
  /** 単位（例: kg） */
  unit?: string;
  /** 小数を入力できるか（重量のみ） */
  decimal?: boolean;
  /** 小さめの表示（セットごとの入力で2つ横に並べる） */
  compact?: boolean;
};

/** 小数の誤差（0.1 + 0.2 など）を消して文字列にする */
const format = (n: number) => String(Math.round(n * 100) / 100);

/**
 * −/＋ ボタン付きの数値入力。ジムで片手でも操作しやすいよう、ボタンで増減できる。
 * 直接入力もできる。
 */
export default function NumberStepper({
  label,
  value,
  onChange,
  step,
  min,
  unit,
  decimal = false,
  compact = false,
}: NumberStepperProps) {
  // 入力が数値でない間は min を基準に増減する
  const current = parseNumberInput(value);
  const base = Number.isFinite(current) ? current : min;
  const canDecrease = base - step >= min;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, compact && styles.rowCompact]}>
        <Pressable
          onPress={() => onChange(format(Math.max(min, base - step)))}
          disabled={!canDecrease}
          style={({ pressed }) => [
            styles.button,
            compact && styles.buttonCompact,
            pressed && styles.buttonPressed,
            !canDecrease && styles.buttonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${label}を${step}減らす`}
        >
          <FontAwesome name="minus" size={14} color={Palette.primary} />
        </Pressable>
        <View style={[styles.inputWrap, compact && styles.inputWrapCompact]}>
          <TextInput
            style={[styles.input, compact && styles.inputCompact]}
            value={value}
            onChangeText={onChange}
            keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
            selectTextOnFocus
            accessibilityLabel={label}
          />
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </View>
        <Pressable
          onPress={() => onChange(format(base + step))}
          style={({ pressed }) => [
            styles.button,
            compact && styles.buttonCompact,
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${label}を${step}増やす`}
        >
          <FontAwesome name="plus" size={14} color={Palette.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: Palette.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.6,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  inputWrap: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    // 単位の分だけ縮められるようにする（Web では既定の最小幅で単位がはみ出すため）
    minWidth: 0,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: Palette.text,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  containerCompact: {
    flex: 1,
    gap: 4,
  },
  rowCompact: {
    gap: 6,
  },
  buttonCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  inputWrapCompact: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  inputCompact: {
    fontSize: 17,
  },
});
