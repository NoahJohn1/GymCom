import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { Exercise, MuscleGroup } from '../../types';
import { generateId } from '../../utils/generateId';

interface ExerciseFormModalProps {
  visible: boolean;
  editing: Exercise | null;
  initialName?: string;
  onSave: (exercise: Exercise) => void;
  onClose: () => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'legs', 'glutes', 'core', 'cardio', 'full_body', 'other',
];

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders',
  biceps: 'Biceps', triceps: 'Triceps', legs: 'Legs',
  glutes: 'Glutes', core: 'Core', cardio: 'Cardio',
  full_body: 'Full Body', other: 'Other',
};

export function ExerciseFormModal({ visible, editing, initialName, onSave, onClose }: ExerciseFormModalProps) {
  const colors = useColors();

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('other');
  const [exType, setExType] = useState<'weight' | 'time'>('weight');

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setMuscleGroup(editing.muscleGroup);
      setExType(editing.type);
    } else {
      setName(initialName ?? '');
      setMuscleGroup('other');
      setExType('weight');
    }
  }, [editing, visible]);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;

    const exercise: Exercise = {
      id: editing?.id ?? generateId(),
      name: trimmed,
      muscleGroup,
      equipment: editing?.equipment ?? 'other',
      type: exType,
      isCustom: editing?.isCustom ?? true,
      notes: editing?.notes,
    };

    onSave(exercise);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <Text style={[Typography.h2, { color: colors.text }]}>
                {editing ? 'Edit Exercise' : 'New Exercise'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View style={styles.field}>
              <Text style={[Typography.small, { color: colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' }]}>
                NAME
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Exercise name"
                placeholderTextColor={colors.textSecondary}
                autoFocus={!editing}
              />
            </View>

            {/* Type toggle */}
            <View style={styles.field}>
              <Text style={[Typography.small, { color: colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' }]}>
                TYPE
              </Text>
              <View style={[styles.toggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {(['weight', 'time'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.toggleOption, exType === t && { backgroundColor: colors.primary }]}
                    onPress={() => setExType(t)}
                  >
                    <Text
                      style={[
                        Typography.body,
                        { color: exType === t ? colors.white : colors.textSecondary, fontWeight: '500' },
                      ]}
                    >
                      {t === 'weight' ? 'Weight' : 'Time'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Muscle group */}
            <View style={styles.field}>
              <Text style={[Typography.small, { color: colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' }]}>
                MUSCLE GROUP
              </Text>
              <View style={styles.chips}>
                {MUSCLE_GROUPS.map((mg) => (
                  <TouchableOpacity
                    key={mg}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: muscleGroup === mg ? colors.primary : colors.card,
                        borderColor: muscleGroup === mg ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setMuscleGroup(mg)}
                  >
                    <Text
                      style={[
                        Typography.small,
                        { color: muscleGroup === mg ? colors.white : colors.text, fontWeight: '500' },
                      ]}
                    >
                      {MUSCLE_LABELS[mg]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: name.trim() ? colors.primary : colors.border }]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={[Typography.body, { color: colors.white, fontWeight: '600' }]}>
                {editing ? 'Save Changes' : 'Create Exercise'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  field: { marginBottom: Spacing.lg },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
  },
  toggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  toggleOption: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  saveBtn: {
    height: 50,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
});
