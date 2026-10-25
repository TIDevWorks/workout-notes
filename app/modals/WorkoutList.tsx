// modals/WorkoutList.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Palette } from '@/constants/Colors';
import { TrainingCategory } from '@/constants/training';
import TrainingList from '@/components/TrainingList';

const TabContext = createContext<{
  activeTab: TrainingCategory;
  setActiveTab: (tab: TrainingCategory) => void;
}>({
  activeTab: 'freeWeights',
  setActiveTab: () => {},
});

type TabProps = {
  label: string;
  value: TrainingCategory;
};

function TabButton({ label, value }: TabProps) {
  const { activeTab, setActiveTab } = useContext(TabContext);
  const isActive = activeTab === value;

  return (
    <Pressable
      style={[styles.segment, isActive && styles.activeSegment]}
      onPress={() => setActiveTab(value)}
    >
      <Text style={[styles.segmentText, isActive && styles.activeSegmentText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function WorkoutList() {
  const [activeTab, setActiveTab] = useState<TrainingCategory>('freeWeights');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const getUserId = async () => {
      const uuid = await AsyncStorage.getItem('@uuid');
      if (uuid) setUserId(uuid);
    };
    getUserId();
  }, []);

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      <View style={styles.container}>
        <View style={styles.grabberRow}>
          <View style={styles.grabber} />
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Select Workout</Text>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            {({ pressed }) => (
              <Text style={[styles.close, pressed && styles.closePressed]}>
                閉じる
              </Text>
            )}
          </Pressable>
        </View>
        <View style={styles.segmentContainer}>
          <TabButton label="Bodyweight" value="bodyweight" />
          <TabButton label="Machine" value="machine" />
          <TabButton label="Free Weights" value="freeWeights" />
        </View>
        {userId && <TrainingList category={activeTab} userId={userId} />}
      </View>
    </TabContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  grabberRow: {
    alignItems: 'center',
    paddingTop: 8,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.dashed,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
  },
  close: {
    fontSize: 14,
    fontWeight: '500',
    color: Palette.primary,
  },
  closePressed: {
    color: Palette.primaryPressed,
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: 3,
    marginHorizontal: 20,
    padding: 3,
    borderRadius: 10,
    backgroundColor: Palette.surfaceMuted,
  },
  segment: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSegment: {
    backgroundColor: Palette.surface,
    shadowColor: Palette.text,
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.textMuted,
  },
  activeSegmentText: {
    fontWeight: '700',
    color: Palette.text,
  },
});
