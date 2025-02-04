import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [initializing, setInitializing] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('@auth_token');
        if (!token) {
          router.replace('/auth/login');
        }
      } finally {
        if (loaded) {
          await SplashScreen.hideAsync();
        }
        setInitializing(false);
      }
    };
    init();
  }, [loaded]);

  if (!loaded || initializing) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" redirect={!initializing} />
        <Stack.Screen name="auth" />
      </Stack>
    </ThemeProvider>
  );
}