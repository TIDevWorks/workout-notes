import { StyleSheet, View, Text } from "react-native";

export default function WorkoutList() {
  return (
    <View style={styles.container}>
      <View style={styles.workoutList}>
        <Text>ベンチプレス</Text>
      </View>
      <View style={styles.workoutList}>
        <Text>スクワット</Text>
      </View>
      <View style={styles.workoutList}>
        <Text>デッドリフト</Text>
      </View>
      <View style={styles.workoutList}>
        <Text>チェストプレス</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: "5%",
    backgroundColor: "#fff",
    flex: 1,
  },
  workoutList: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "5%",
    borderColor: "#E9E7FD",
    borderBottomWidth: 1,
  },
});
