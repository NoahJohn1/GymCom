import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RestTimer } from '../../components/workout/RestTimer';
import { useColors, Spacing } from '../../constants/theme';

export default function HomeScreen() {
  const colors = useColors();

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <RestTimer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 5 },
});
