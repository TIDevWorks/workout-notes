import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
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
  return (
    <Link href={{ pathname: '/modals/WorkoutList', params: { date } }} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <View style={styles.iconCircle}>
          <FontAwesome name="plus" size={11} color={Palette.white} />
        </View>
        <Text style={styles.text}>Add Workout</Text>
      </Pressable>
    </Link>
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
