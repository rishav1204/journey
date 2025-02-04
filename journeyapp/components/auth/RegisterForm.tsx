import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import * as authService from "@/services/auth";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      await authService.register({ email, password, username });
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      <Input
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button 
        title="Sign Up" 
        onPress={handleSubmit}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  }
});