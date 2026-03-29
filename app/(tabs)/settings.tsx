import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors, Spacing } from '../../constants/theme';
import { ProfileSection } from '../../components/settings/ProfileSection';
import { ThemeColorPicker } from '../../components/settings/ThemeColorPicker';
import { DevSplitSettings } from '../../components/settings/DevSplitSettings';
import { SplitDaySettings } from '../../components/settings/SplitDaySettings';

export default function SettingsScreen() {
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <ProfileSection />
        <ThemeColorPicker />
        <SplitDaySettings />
        <DevSplitSettings />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xl },
});
