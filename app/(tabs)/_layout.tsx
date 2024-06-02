import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { getTheme, setTheme } from '@/helper/checkTheme';
import HeaderRight from '@/components/HeaderRight';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<'light' | 'dark'>(
    systemColorScheme ?? 'light',
  );
  const [icon, setIcon] = useState<'sun-o' | 'moon-o'>('sun-o');

  useEffect(() => {
    const fetchTheme = async () => {
      const storedTheme = await getTheme();
      setThemeState(storedTheme);
      setIcon(storedTheme === 'light' ? 'sun-o' : 'moon-o');
    };

    fetchTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    setIcon(newTheme === 'light' ? 'sun-o' : 'moon-o');
    await setTheme(newTheme);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tint,
      }}
    >
      <Tabs.Screen
        name="OtherPage"
        options={{
          title: 'Other',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="info-circle" color={color} />
          ),
          headerRight: () => (
            <HeaderRight icon={icon} theme={theme} toggleTheme={toggleTheme} />
          ),
        }}
      />
      <Tabs.Screen
        name="ChartPage"
        options={{
          title: 'Chart',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="line-chart" color={color} />
          ),
          headerRight: () => (
            <HeaderRight icon={icon} theme={theme} toggleTheme={toggleTheme} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
          headerRight: () => (
            <HeaderRight icon={icon} theme={theme} toggleTheme={toggleTheme} />
          ),
        }}
      />
    </Tabs>
  );
}
