// components/ui/TabBarBackground.tsx
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  if (Platform.OS === 'ios') {
    return <BlurView intensity={80} style={StyleSheet.absoluteFill} />;
  }

  return (
    <BlurView 
      intensity={100} 
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor }
      ]} 
    />
  );
}