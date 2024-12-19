// modals/WorkoutList.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  return (
    <Pressable
      style={[styles.tab, activeTab === value && styles.activeTab]}
      onPress={() => setActiveTab(value)}
    >
      <Text
        style={[styles.tabText, activeTab === value && styles.activeTabText]}
      >
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
        <View style={styles.tabContainer}>
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
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3A9DE0',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#3A9DE0',
    fontWeight: 'bold',
  },
});
