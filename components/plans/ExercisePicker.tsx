/**
 * ExercisePicker
 * Modal component for selecting an exercise from the library or creating a new one.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { Exercise, MuscleGroup } from '../../types';
import { useApp } from '../../context/AppContext';

interface ExercisePickerProps {
  visible: boolean;
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  legs: 'Legs',
  glutes: 'Glutes',
  core: 'Core',
  cardio: 'Cardio',
  full_body: 'Full Body',
  other: 'Other',
};

export function ExercisePicker({ visible, onSelect, onClose }: ExercisePickerProps) {
  const colors = useColors();
  const { exercises } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MuscleGroup | null>(null);

  const filtered = exercises.filter((ex) => {
    const matchesQuery = ex.name.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter ? ex.muscleGroup === filter : true;
    return matchesQuery && matchesFilter;
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[Typography.h2, { color: colors.text }]}>Select Exercise</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Muscle group filter chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]}
          keyExtractor={(item) => item}
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
              onPress={() => setFilter(filter === item ? null : item)}
            >
              <Text
                style={[
                  Typography.small,
                  { color: filter === item ? colors.white : colors.text, fontWeight: '500' },
                ]}
              >
                {MUSCLE_GROUP_LABELS[item]}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Exercise list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: colors.border }]}
              onPress={() => { onSelect(item); onClose(); }}
            >
              <View style={styles.rowContent}>
                <Text style={[Typography.body, { color: colors.text }]}>{item.name}</Text>
                <Text style={[Typography.small, { color: colors.textSecondary }]}>
                  {MUSCLE_GROUP_LABELS[item.muscleGroup]} · {item.equipment}
                </Text>
              </View>
              <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', paddingTop: Spacing.xl }]}>
              No exercises found.
            </Text>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchInput: { flex: 1, ...Typography.body },
  chips: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  list: { paddingHorizontal: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowContent: { flex: 1, gap: Spacing.xs },
});
