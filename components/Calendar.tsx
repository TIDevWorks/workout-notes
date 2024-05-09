import { Dimensions, StyleSheet, View } from "react-native";
import { CalendarList } from "react-native-calendars";

export default function Calendar() {
  const deviceWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <CalendarList
          horizontal={true}
          pagingEnabled={true}
          pastScrollRange={24}
          futureScrollRange={0}
          calendarWidth={deviceWidth * 0.9}
          hideArrows={false}
          disableArrowLeft={false}
          disableArrowRight={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: "5%",
  },
  calendarContainer: {
    marginTop: 15,
    borderRadius: 50,
    overflow: "hidden",
    elevation: 4,
  },
});
