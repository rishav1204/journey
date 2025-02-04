// components/profile/SettingsItem.tsx
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type Props = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

export function SettingsItem({ label, onPress, destructive }: Props) {
  const colorScheme = useColorScheme();
  const color = destructive ? '#FF3B30' : Colors[colorScheme ?? 'light'].text;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <ThemedText style={[styles.label, { color }]}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  label: {
    fontSize: 16,
  }
});