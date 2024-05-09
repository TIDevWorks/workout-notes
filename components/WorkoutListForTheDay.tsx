import { StyleSheet, View, Text } from "react-native";

export default function WorkoutList() {
  return (
    <View style={styles.container}>
      <View style={styles.workoutList}>
        <Text>a</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: "5%",
  },
  workoutList: {
    justifyContent: "center",
    marginTop: 15,
    borderRadius: 50,
    elevation: 4,
  },
});
