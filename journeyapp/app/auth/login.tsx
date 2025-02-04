import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { LoginForm } from '@/components/auth/LoginForm';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Button } from '@/components/common/Button';

export default function LoginScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome Back</ThemedText>
      <LoginForm />
      <View style={styles.buttons}>
        <Link href="/auth/forgot-password" asChild>
          <Button title="Forgot Password?" variant="secondary" />
        </Link>
        <Link href="/auth/register" asChild>
          <Button title="Create Account" variant="secondary" />
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttons: {
    width: '100%',
    maxWidth: 400,
    gap: 8,
    marginTop: 16
  }
});