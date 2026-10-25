import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Palette, Shadow } from '@/constants/Colors';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** 控えめな見た目（再発行など、主要ではない操作） */
  variant?: 'primary' | 'secondary';
};

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: PrimaryButtonProps) {
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        pressed &&
          (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
        inactive && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? Palette.white : Palette.primary}
        />
      ) : (
        <Text style={[styles.label, !isPrimary && styles.secondaryLabel]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Palette.primary,
    ...Shadow.primaryButton,
  },
  primaryPressed: {
    backgroundColor: Palette.primaryPressed,
  },
  secondary: {
    backgroundColor: Palette.primarySoft,
  },
  secondaryPressed: {
    opacity: 0.7,
  },
  inactive: {
    opacity: 0.5,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.white,
  },
  secondaryLabel: {
    color: Palette.primary,
  },
});
