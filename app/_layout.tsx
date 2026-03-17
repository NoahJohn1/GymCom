import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AppProvider, useApp } from '../context/AppContext';
import { Colors, ThemeContext } from '../constants/theme';

function RootNavigator() {
  const { isLoading, preferences } = useApp();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const onboardingComplete = preferences.onboardingComplete === true;
    const inApp = segments[0] === '(tabs)';

    if (onboardingComplete && !inApp) {
      router.replace('/(tabs)/');
    } else if (!onboardingComplete && inApp) {
      router.replace('/welcome');
    }
  }, [isLoading, preferences.onboardingComplete, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.card },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

function ThemeColorSync({ children }: { children: React.ReactNode }) {
  const { preferences } = useApp();
  return (
    <ThemeContext.Provider value={{ accentColor: preferences.themeColor ?? null }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <ThemeColorSync>
            <RootNavigator />
          </ThemeColorSync>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
