import { View, StyleSheet } from "react-native";
import AddWorkoutButton from "@/components/AddWorkoutButton";
import Calendar from "@/components/Calendar";
import WorkoutList from "@/components/WorkoutListForTheDay";

export default function Index() {
  return (
    <View style={styles.container}>
      <Calendar />
      <WorkoutList />
      <AddWorkoutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
});
