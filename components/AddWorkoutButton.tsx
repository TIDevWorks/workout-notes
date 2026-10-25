import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { Palette, Shadow } from '@/constants/Colors';

type AddWorkoutButtonProps = {
  /** 記録を追加する日付（YYYY-MM-DD） */
  date: string;
};

/**
 * Calendar 画面の下に浮かぶ Add Workout ボタン。
 * Select Workout モーダルを開き、記録する日付を URL パラメータで渡す。
 */
const AddWorkoutButton = ({ date }: AddWorkoutButtonProps) => {
  // <Link asChild> は子の style をオブジェクトとして合成するため、関数の style
  // （押下状態で色を変える）が消えてボタンが表示されなくなる。そのため router.push で遷移する
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/modals/WorkoutList', params: { date } })
      }
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityRole="button"
      accessibilityLabel="Add Workout"
    >
      <View style={styles.iconCircle}>
        <FontAwesome name="plus" size={11} color={Palette.white} />
      </View>
      <Text style={styles.text}>Add Workout</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 18,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Shadow.primaryButton,
  },
  buttonPressed: {
    backgroundColor: Palette.primaryPressed,
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Palette.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AddWorkoutButton;
