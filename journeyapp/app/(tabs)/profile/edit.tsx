import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';

export default function EditProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Edit Profile</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  }
});