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
import { ExerciseFormModal } from './ExerciseFormModal';

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
  const { exercises, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MuscleGroup | null>(null);
  const [createVisible, setCreateVisible] = useState(false);

  const filtered = exercises.filter((ex) => {
    const matchesQuery = ex.name.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter ? ex.muscleGroup === filter : true;
    return matchesQuery && matchesFilter;
  });

  const showCreateShortcut = query.trim().length > 0 && filtered.length === 0;

  function handleCreateNew(exercise: Exercise) {
    dispatch({ type: 'ADD_EXERCISE', exercise });
    onSelect(exercise);
    setCreateVisible(false);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[Typography.h2, { color: colors.text }]}>Select Exercise</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Muscle group filter chips — flex: 0 prevents vertical expansion */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]}
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
          style={styles.list}
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: colors.border }]}
              onPress={() => { onSelect(item); onClose(); }}
            >
              <View style={styles.rowContent}>
                <View style={styles.nameRow}>
                  <Text style={[Typography.body, { color: colors.text }]}>{item.name}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[Typography.small, { color: colors.primary, fontWeight: '600' }]}>
                      {item.type === 'time' ? 'Time' : 'Weight'}
                    </Text>
                  </View>
                </View>
                <Text style={[Typography.small, { color: colors.textSecondary }]}>
                  {MUSCLE_GROUP_LABELS[item.muscleGroup]} · {item.equipment}
                </Text>
              </View>
              <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            showCreateShortcut ? (
              <TouchableOpacity
                style={[styles.createRow, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
                onPress={() => setCreateVisible(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={[Typography.body, { color: colors.primary, fontWeight: '600' }]}>
                  Create "{query.trim()}"
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', paddingTop: Spacing.xl }]}>
                No exercises found.
              </Text>
            )
          }
        />
      </SafeAreaView>

      <ExerciseFormModal
        visible={createVisible}
        editing={null}
        initialName={query.trim()}
        onSave={handleCreateNew}
        onClose={() => setCreateVisible(false)}
      />
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
  // flex: 0 is the pill-height bug fix — prevents the FlatList from flex-expanding vertically
  chipsRow: { flex: 0, flexGrow: 0, flexShrink: 0 },
  chips: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  rowContent: { flex: 1, gap: Spacing.xs },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    minHeight: 44,
  },
});
