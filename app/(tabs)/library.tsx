import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { ExerciseFormModal } from '../../components/plans/ExerciseFormModal';
import { SlotEditModal } from '../../components/plans/SlotEditModal';
import { buildWeightDetail, buildTimeDetail } from '../../components/plans/ExerciseSlotCard';
import { Exercise, ExerciseDefaults, MuscleGroup } from '../../types';

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders',
  biceps: 'Biceps', triceps: 'Triceps', legs: 'Legs',
  glutes: 'Glutes', core: 'Core', cardio: 'Cardio',
  full_body: 'Full Body', other: 'Other',
};

const MUSCLE_ORDER: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'legs', 'glutes', 'core', 'cardio', 'full_body', 'other',
];

type FilterOption = 'all' | MuscleGroup;

const FILTER_OPTIONS: FilterOption[] = ['all', ...MUSCLE_ORDER];

export default function LibraryScreen() {
  const colors = useColors();
  const { exercises, splits, preferences, dispatch } = useApp();

  const [filter, setFilter] = useState<FilterOption>('all');
  const [formVisible, setFormVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editingDefaultsExerciseId, setEditingDefaultsExerciseId] = useState<string | null>(null);

  const activeSplit = splits.find((s) => s.id === preferences.activeSplitId);

  const pinnedIds = useMemo(
    () => new Set(preferences.pinnedExerciseIds ?? []),
    [preferences.pinnedExerciseIds],
  );

  const togglePin = useCallback((id: string) => {
    const current = preferences.pinnedExerciseIds ?? [];
    const next = current.includes(id)
      ? current.filter((pid) => pid !== id)
      : [...current, id];
    dispatch({ type: 'SET_PREFERENCES', preferences: { pinnedExerciseIds: next } });
  }, [preferences.pinnedExerciseIds, dispatch]);

  // Build sections for the list
  const sections = useMemo(() => {
    const sorted = (list: Exercise[]) =>
      [...list].sort((a, b) => a.name.localeCompare(b.name));

    if (filter === 'all') {
      const pinned = exercises.filter((ex) => pinnedIds.has(ex.id));
      const result: { title: string; data: Exercise[] }[] = [];

      if (pinned.length > 0) {
        result.push({ title: 'Pinned', data: sorted(pinned) });
      }

      for (const mg of MUSCLE_ORDER) {
        const group = exercises.filter((ex) => ex.muscleGroup === mg && !pinnedIds.has(ex.id));
        if (group.length > 0) {
          result.push({ title: MUSCLE_LABELS[mg], data: sorted(group) });
        }
      }

      return result;
    }

    const groupExercises = exercises.filter((ex) => ex.muscleGroup === filter);
    const pinned = groupExercises.filter((ex) => pinnedIds.has(ex.id));
    const unpinned = groupExercises.filter((ex) => !pinnedIds.has(ex.id));
    const result: { title: string; data: Exercise[] }[] = [];

    if (pinned.length > 0) {
      result.push({ title: 'Pinned', data: sorted(pinned) });
    }
    if (unpinned.length > 0) {
      result.push({ title: MUSCLE_LABELS[filter], data: sorted(unpinned) });
    }

    return result;
  }, [exercises, filter, pinnedIds]);

  function handleEdit(exercise: Exercise) {
    setEditingExercise(exercise);
    setFormVisible(true);
  }

  function handleDelete(exercise: Exercise) {
    Alert.alert(
      'Delete Exercise',
      `Delete "${exercise.name}"? This will not affect existing workout slots.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_EXERCISE', id: exercise.id }) },
      ],
    );
  }

  function handleSave(exercise: Exercise) {
    if (editingExercise) {
      dispatch({ type: 'UPDATE_EXERCISE', exercise });
    } else {
      dispatch({ type: 'ADD_EXERCISE', exercise });
    }
    setEditingExercise(null);
  }

  function openCreate() {
    setEditingExercise(null);
    setFormVisible(true);
  }

  function handleTapExercise(exercise: Exercise) {
    if (!activeSplit) return;
    // Set initial defaults if not present
    if (!activeSplit.exerciseDefaults?.[exercise.id]) {
      const defaults: ExerciseDefaults =
        exercise.type === 'time'
          ? { sets: 3, duration: '60s' }
          : { sets: 3, reps: '8-12' };
      dispatch({ type: 'SET_EXERCISE_DEFAULTS', splitId: activeSplit.id, exerciseId: exercise.id, defaults });
    }
    setEditingDefaultsExerciseId(exercise.id);
  }

  function handleSaveDefaults(updated: ExerciseDefaults) {
    if (!activeSplit || !editingDefaultsExerciseId) return;
    dispatch({ type: 'SET_EXERCISE_DEFAULTS', splitId: activeSplit.id, exerciseId: editingDefaultsExerciseId, defaults: updated });
  }

  function getFilterLabel(f: FilterOption): string {
    return f === 'all' ? 'All' : MUSCLE_LABELS[f];
  }

  function getDetailString(exercise: Exercise): string | null {
    if (!activeSplit) return null;
    const defaults = activeSplit.exerciseDefaults?.[exercise.id];
    if (!defaults) return null;
    return exercise.type === 'time'
      ? buildTimeDetail(defaults)
      : buildWeightDetail(defaults, preferences.unit);
  }

  const editingDefaultsExercise = editingDefaultsExerciseId
    ? exercises.find((e) => e.id === editingDefaultsExerciseId) ?? null
    : null;
  const editingDefaults = editingDefaultsExerciseId && activeSplit
    ? activeSplit.exerciseDefaults?.[editingDefaultsExerciseId] ?? null
    : null;

  function renderExerciseRow({ item }: { item: Exercise }) {
    const isPinned = pinnedIds.has(item.id);
    const detail = getDetailString(item);

    return (
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handleTapExercise(item)}
        activeOpacity={activeSplit ? 0.7 : 1}
        disabled={!activeSplit}
      >
        <TouchableOpacity
          onPress={() => togglePin(item.id)}
          style={styles.pinBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isPinned ? 'star' : 'star-outline'}
            size={20}
            color={isPinned ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.rowContent}>
          <View style={styles.nameRow}>
            <Text style={[Typography.body, { color: colors.text, fontWeight: '500', flex: 1 }]}>{item.name}</Text>
            <View style={[styles.typeBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[Typography.small, { color: colors.primary, fontWeight: '600' }]}>
                {item.type === 'time' ? 'Time' : 'Weight'}
              </Text>
            </View>
          </View>
          {detail ? (
            <Text style={[Typography.small, { color: colors.textSecondary }]}>
              {detail}
            </Text>
          ) : (
            <Text style={[Typography.small, { color: colors.textSecondary }]}>
              {activeSplit ? 'Tap to set details' : item.equipment}
            </Text>
          )}
        </View>

        <View style={styles.rowActions}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pencil-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Active split indicator */}
      {activeSplit ? (
        <View style={styles.splitIndicator}>
          <Text style={[Typography.small, { color: colors.textSecondary }]}>
            Showing data for:{' '}
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{activeSplit.name}</Text>
          </Text>
        </View>
      ) : null}

      {/* Muscle group filter pills */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTER_OPTIONS}
        keyExtractor={(item) => item}
        style={styles.chipsRow}
        contentContainerStyle={styles.chips}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor: filter === item ? colors.primary : colors.card,
                borderColor: filter === item ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setFilter(item)}
          >
            <Text
              style={[
                Typography.small,
                { color: filter === item ? colors.white : colors.text, fontWeight: '500' },
              ]}
            >
              {getFilterLabel(item)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Exercise list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, { color: colors.textSecondary, backgroundColor: colors.background }]}>
            {section.title.toUpperCase()}
          </Text>
        )}
        renderItem={renderExerciseRow}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
              No exercises found.
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={openCreate}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      <ExerciseFormModal
        visible={formVisible}
        editing={editingExercise}
        onSave={handleSave}
        onClose={() => { setFormVisible(false); setEditingExercise(null); }}
      />

      <SlotEditModal
        visible={editingDefaultsExerciseId !== null}
        defaults={editingDefaults}
        exercise={editingDefaultsExercise}
        unit={preferences.unit}
        onSave={handleSaveDefaults}
        onClose={() => setEditingDefaultsExerciseId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Split indicator ──
  splitIndicator: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },

  // ── Filter pills ──
  chipsRow: { flex: 0, flexGrow: 0, flexShrink: 0 },
  chips: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
  },

  // ── Section headers ──
  sectionHeader: {
    ...Typography.small,
    fontWeight: '600',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    letterSpacing: 0.8,
  },

  // ── Exercise rows ──
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingRight: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  pinBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  rowActions: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: { padding: Spacing.xs },

  // ── Empty / FAB ──
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
