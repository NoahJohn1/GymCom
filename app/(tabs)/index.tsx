import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RestTimer } from '../../components/workout/RestTimer';
import { SplitTracker } from '../../components/home/SplitTracker';
import { useColors, Spacing } from '../../constants/theme';

export default function HomeScreen() {
  const colors = useColors();
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <RestTimer />
        <SplitTracker />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.md },
});
