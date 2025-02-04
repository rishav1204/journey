import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { SettingsItem } from '@/components/profile/SettingsItem';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const { logout } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <SettingsItem
          label="Edit Profile"
          onPress={() => router.push('/profile/edit')}
        />
        <SettingsItem
          label="Privacy Settings"
          onPress={() => router.push('/profile/privacy')}
        />
        <SettingsItem
          label="Notifications"
          onPress={() => router.push('/profile/notifications')}
        />
        <SettingsItem
          label="Logout"
          onPress={logout}
          destructive
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});