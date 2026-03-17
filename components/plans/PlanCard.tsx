import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { WorkoutPlan } from '../../types';
import { useApp } from '../../context/AppContext';

interface PlanCardProps {
  plan: WorkoutPlan;
  onDelete: () => void;
}

export function PlanCard({ plan, onDelete }: PlanCardProps) {
  const colors = useColors();
  const { exercises } = useApp();

  const exerciseNames = plan.exercises
    .slice(0, 3)
    .map((p) => exercises.find((e) => e.id === p.exerciseId)?.name ?? 'Unknown')
    .join(', ');

  const overflow = plan.exercises.length - 3;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.content}>
        <Text style={[Typography.h3, { color: colors.text }]}>{plan.name}</Text>
        {plan.description ? (
          <Text style={[Typography.small, { color: colors.textSecondary }]} numberOfLines={1}>
            {plan.description}
          </Text>
        ) : null}
        <Text style={[Typography.small, { color: colors.textSecondary }]} numberOfLines={1}>
          {exerciseNames}
          {overflow > 0 ? ` +${overflow} more` : ''}
        </Text>
        <Text style={[Typography.small, { color: colors.textSecondary }]}>
          {plan.exercises.length} exercise{plan.exercises.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.actions}>
        {/* TODO: navigate to plan editor */}
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="pencil-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
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
