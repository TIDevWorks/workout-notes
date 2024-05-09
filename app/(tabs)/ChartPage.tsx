import { Text, View } from "@/components/Themed";
import { StyleSheet } from "react-native";

export default function ChartPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chart</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
