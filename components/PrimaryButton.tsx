import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Palette, Shadow } from '@/constants/Colors';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** 控えめな見た目（再発行など、主要ではない操作） */
  variant?: 'primary' | 'secondary';
  /** 文字の左に丸で囲んだアイコンを出す（Add Workout ボタンと同じ見た目） */
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
};

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  icon,
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
        <View style={styles.content}>
          {icon && (
            <View
              style={[
                styles.iconCircle,
                !isPrimary && styles.secondaryIconCircle,
              ]}
            >
              <FontAwesome
                name={icon}
                size={11}
                color={isPrimary ? Palette.white : Palette.primary}
              />
            </View>
          )}
          <Text style={[styles.label, !isPrimary && styles.secondaryLabel]}>
            {label}
          </Text>
        </View>
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryIconCircle: {
    backgroundColor: 'rgba(31,120,186,0.14)',
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
