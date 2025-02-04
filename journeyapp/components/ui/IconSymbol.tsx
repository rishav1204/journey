import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type Props = {
  name: string;
  color?: string;
  size?: number;
};

export function IconSymbol({ name, color, size = 24 }: Props) {
  const colorScheme = useColorScheme();
  const defaultColor = Colors[colorScheme ?? 'light'].icon;

  return (
    <Ionicons 
      name={name as any}
      size={size}
      color={color ?? defaultColor}
      style={styles.icon}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    opacity: 0.8
  }
});