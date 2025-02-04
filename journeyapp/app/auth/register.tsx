import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Button } from '@/components/common/Button';

export default function RegisterScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Create Account</ThemedText>
      <RegisterForm />
      <Link href="/auth/login" asChild>
        <Button title="Already have an account? Login" variant="secondary" />
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16
  }
});