import React from 'react';
import { Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';

interface HeaderRightProps {
  icon: 'sun-o' | 'moon-o';
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const HeaderRight: React.FC<HeaderRightProps> = ({
  icon,
  theme,
  toggleTheme,
}) => (
  <Pressable onPress={toggleTheme}>
    {({ pressed }) => (
      <FontAwesome
        name={icon}
        size={25}
        color={Colors[theme].text}
        style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
      />
    )}
  </Pressable>
);

export default HeaderRight;
