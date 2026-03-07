import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '../hooks/use-color-scheme';
import { AuthProvider } from '../context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="login" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="abonnement" options={{ presentation: 'modal' }} />
              <Stack.Screen name="voyage_control" />
              <Stack.Screen name="renew" options={{ presentation: 'modal' }} />
              <Stack.Screen name="pass" options={{ presentation: 'modal' }} />
              <Stack.Screen name="notifications" />
            </Stack>
            <StatusBar style="auto" />
          </SafeAreaView>
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
