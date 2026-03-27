import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { Split } from '../../types';

interface SplitCardProps {
  split: Split;
  workoutCount: number;
  onPress: () => void;
  onDelete: () => void;
}

export function SplitCard({ split, workoutCount, onPress, onDelete }: SplitCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={[Typography.h3, { color: colors.text }]}>{split.name}</Text>
        {split.description ? (
          <Text style={[Typography.small, { color: colors.textSecondary }]} numberOfLines={1}>
            {split.description}
          </Text>
        ) : null}
        <Text style={[Typography.small, { color: colors.textSecondary }]}>
          {workoutCount} workout{workoutCount !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  content: { flex: 1, gap: Spacing.xs },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: { padding: Spacing.xs },
});
