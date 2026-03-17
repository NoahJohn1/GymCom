import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useColors, Typography, Spacing } from '../constants/theme';

export default function WelcomeScreen() {
  const colors = useColors();
  const { dispatch } = useApp();
  const router = useRouter();

  function handleGetStarted() {
    dispatch({
      type: 'SET_PREFERENCES',
      preferences: { onboardingComplete: true },
    });
    router.replace('/(tabs)/');
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.logo, { color: colors.primary }]}>GymCom</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Your gym companion
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleGetStarted}
      >
        <Text style={[styles.buttonText, { color: colors.white }]}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
  },
  tagline: {
    ...Typography.body,
    marginTop: Spacing.sm,
  },
  button: {
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  buttonText: {
    ...Typography.h3,
  },
});
