import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link } from "expo-router";
import { Pressable, StyleSheet, View, Text } from "react-native";

const AddWorkoutButton = () => {
  return (
    <View style={styles.container}>
      <Link href="/modals/WorkoutList" asChild>
        <Pressable>
          {({ pressed }) => (
            <View style={styles.buttonContent}>
              <Text style={styles.text}>Add Workout</Text>
              <FontAwesome
                name="plus-circle"
                size={25}
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            </View>
          )}
        </Pressable>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 50,
    marginHorizontal: "10%",
    marginVertical: 18,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#000",
    marginRight: 15,
  },
});

export default AddWorkoutButton;
