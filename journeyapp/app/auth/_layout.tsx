import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack initialRouteName="login">
      <Stack.Screen 
        name="login" 
        options={{
          title: 'Login',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          title: 'Sign Up',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{
          title: 'Reset Password',
          headerShown: true
        }}
      />
    </Stack>
  );
}