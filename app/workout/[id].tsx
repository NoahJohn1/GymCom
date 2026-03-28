import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { ExerciseSlotCard } from '../../components/plans/ExerciseSlotCard';
import { ExercisePicker } from '../../components/plans/ExercisePicker';
import { SlotEditModal } from '../../components/plans/SlotEditModal';
import { Exercise, ExerciseDefaults, PlannedExercise } from '../../types';

export default function WorkoutEditorScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workouts, splits, exercises, preferences, dispatch } = useApp();

  const workout = workouts.find((w) => w.id === id);
  const split = workout ? splits.find((s) => s.id === workout.splitId) : null;

  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingTitleMode, setEditingTitleMode] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  if (!workout) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.xl }]}>
          Workout not found.
        </Text>
      </SafeAreaView>
    );
  }

  function handleAddSlot(exercise: Exercise) {
    if (!workout || !split) return;

    // Add the exercise to this workout's slot list
    const newSlot: PlannedExercise = { exerciseId: exercise.id };
    dispatch({
      type: 'UPDATE_WORKOUT',
      workout: { ...workout, exerciseSlots: [...workout.exerciseSlots, newSlot] },
    });

    // Set initial defaults on the split if not already present
    if (!split.exerciseDefaults?.[exercise.id]) {
      const defaults: ExerciseDefaults =
        exercise.type === 'time'
          ? { sets: 3, duration: '60s' }
          : { sets: 3, reps: '8-12' };
      dispatch({ type: 'SET_EXERCISE_DEFAULTS', splitId: split.id, exerciseId: exercise.id, defaults });
    }
  }

  function handleSaveDefaults(updated: ExerciseDefaults) {
    if (!split || !editingExerciseId) return;
    dispatch({ type: 'SET_EXERCISE_DEFAULTS', splitId: split.id, exerciseId: editingExerciseId, defaults: updated });
  }

  function handleDeleteSlot(index: number) {
    Alert.alert('Remove Exercise', 'Remove this exercise from the workout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        if (!workout) return;
        dispatch({ type: 'DELETE_SLOT', workoutId: workout.id, slotIndex: index });
      }},
    ]);
  }

  function startTitleEdit() {
    setTitleDraft(workout!.name);
    setEditingTitleMode(true);
  }

  function commitTitleEdit() {
    const trimmed = titleDraft.trim();
    if (trimmed && workout) {
      dispatch({ type: 'UPDATE_WORKOUT', workout: { ...workout, name: trimmed } });
    }
    setEditingTitleMode(false);
  }

  const editingExercise = editingExerciseId
    ? exercises.find((e) => e.id === editingExerciseId) ?? null
    : null;
  const editingDefaults = editingExerciseId && split
    ? split.exerciseDefaults?.[editingExerciseId] ?? null
    : null;

  function renderItem({ item, index }: { item: PlannedExercise; index: number }) {
    const exercise = exercises.find((e) => e.id === item.exerciseId);
    if (!exercise) return null;
    const defaults = split?.exerciseDefaults?.[item.exerciseId] ?? {};
    return (
      <ExerciseSlotCard
        defaults={defaults}
        exercise={exercise}
        unit={preferences.unit}
        onEdit={() => setEditingExerciseId(item.exerciseId)}
        onDelete={() => handleDeleteSlot(index)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: workout.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      {/* Editable title */}
      <View style={styles.titleRow}>
        {editingTitleMode ? (
          <TextInput
            style={[styles.titleInput, { color: colors.text, borderColor: colors.primary, flex: 1 }]}
            value={titleDraft}
            onChangeText={setTitleDraft}
            onBlur={commitTitleEdit}
            onSubmitEditing={commitTitleEdit}
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <TouchableOpacity style={styles.titleTouchable} onPress={startTitleEdit} onLongPress={startTitleEdit} activeOpacity={0.7}>
            <Text style={[Typography.h1, { color: colors.text, flex: 1 }]}>{workout.name}</Text>
            <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={workout.exerciseSlots}
        keyExtractor={(_, index) => String(index)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="fitness-outline" size={48} color={colors.textSecondary} />
            <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.md }]}>
              No exercises yet.{'\n'}Tap + to add your first exercise.
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setPickerVisible(true)}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      <ExercisePicker
        visible={pickerVisible}
        onSelect={handleAddSlot}
        onClose={() => setPickerVisible(false)}
      />

      <SlotEditModal
        visible={editingExerciseId !== null}
        defaults={editingDefaults}
        exercise={editingExercise}
        unit={preferences.unit}
        onSave={handleSaveDefaults}
        onClose={() => setEditingExerciseId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  titleTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  titleInput: {
    ...Typography.h1,
    borderBottomWidth: 2,
    paddingVertical: Spacing.xs,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xl * 2,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
