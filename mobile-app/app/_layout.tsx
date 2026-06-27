import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { Stack, Redirect, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { registerForPushNotifications } from '../services/notifications';
import { useAuthStore } from '../store/authStore';

// Suppress warnings from react-navigation / gesture-handler that we cannot fix without a library update
LogBox.ignoreLogs(['props.pointerEvents is deprecated']);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 2 } },
});

export default function RootLayout() {
  const segments = useSegments();
  const { isLoading, isAuthenticated, loadAuth } = useAuthStore();

  useEffect(() => {
    loadAuth();
    registerForPushNotifications();
    SplashScreen.hideAsync();
  }, []);

  // Still loading auth from storage — render nothing (splash is still visible)
  if (isLoading) return null;

  const onAuthScreen = (segments[0] === 'login' || segments[0] === 'signup');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />

        {/* Declarative auth redirects — fire at render time, not in useEffect */}
        {!isAuthenticated && !onAuthScreen && <Redirect href="/login" />}
        {isAuthenticated  && onAuthScreen  && <Redirect href="/(tabs)" />}

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#1A1A2E' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="login"              options={{ animation: 'fade' }} />
          <Stack.Screen name="signup"             options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="checkout"           options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="order-confirmation" options={{ animation: 'fade' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
