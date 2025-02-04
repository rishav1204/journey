import { TextInput, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor="#666"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    width: '100%',
  }
});