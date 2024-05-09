import AddWorkoutButton from "@/components/AddWorkoutButton";
import Calendar from "@/components/Calendar";
import WorkoutList from "@/components/WorkoutListForTheDay";

export default function Index() {
  return (
    <>
      <Calendar />
      <WorkoutList />
      <AddWorkoutButton />
    </>
  );
}
