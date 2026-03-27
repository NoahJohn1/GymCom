import React, { useEffect } from 'react';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AppProvider, useApp } from '../context/AppContext';
import { Colors, DarkColors, LightColors, ThemeContext, useColors } from '../constants/theme';

function RootNavigator() {
  const { isLoading, preferences } = useApp();
  const router = useRouter();
  const segments = useSegments();
  const colors = useColors();

  useEffect(() => {
    if (isLoading) return;

    const onboardingComplete = preferences.onboardingComplete === true;
    const onWelcome = segments[0] === 'welcome';

    if (onboardingComplete && onWelcome) {
      router.replace('/(tabs)/');
    } else if (!onboardingComplete && !onWelcome) {
      router.replace('/welcome');
    }
  }, [isLoading, preferences.onboardingComplete, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="split/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="workout/[id]" options={{ headerShown: true }} />
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
  const scheme = useColorScheme();
  const rootBg = scheme === 'dark' ? DarkColors.background : LightColors.background;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: rootBg }}>
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
