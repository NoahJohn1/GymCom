import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { PlanCard } from '../../components/plans/PlanCard';
import { WorkoutPlan } from '../../types';
import { generateId } from '../../utils/generateId';

export default function PlansScreen() {
  const colors = useColors();
  const { workoutPlans, dispatch } = useApp();

  function handleCreatePlan() {
    const now = new Date().toISOString();
    const newPlan: WorkoutPlan = {
      id: generateId(),
      name: 'New Plan',
      exercises: [],
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_PLAN', plan: newPlan });
    // TODO: navigate to plan editor
  }

  function handleDeletePlan(id: string) {
    Alert.alert('Delete Plan', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch({ type: 'DELETE_PLAN', id }),
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>Plans</Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={handleCreatePlan}
          >
            <Text style={[Typography.small, { color: colors.white, fontWeight: '600' }]}>
              + New Plan
            </Text>
          </TouchableOpacity>
        </View>

        {workoutPlans.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
              No plans yet.{'\n'}Create one to get started.
            </Text>
          </View>
        ) : (
          workoutPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onDelete={() => handleDeletePlan(plan.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xl },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: { ...Typography.h1 },
  createButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xl * 2,
  },
});
