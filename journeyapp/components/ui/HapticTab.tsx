// components/ui/HapticTab.tsx
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

export function HapticTab({ onPress, ...props }) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress?.();
  };

  return <TouchableOpacity onPress={handlePress} {...props} />;
}