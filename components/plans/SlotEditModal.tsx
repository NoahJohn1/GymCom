import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { ExerciseDefaults, Exercise, WeightUnit } from '../../types';

interface SlotEditModalProps {
  visible: boolean;
  defaults: ExerciseDefaults | null;
  exercise: Exercise | null;
  unit: WeightUnit;
  onSave: (updated: ExerciseDefaults) => void;
  onClose: () => void;
}

export function SlotEditModal({ visible, defaults, exercise, unit, onSave, onClose }: SlotEditModalProps) {
  const colors = useColors();

  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [workingWeight, setWorkingWeight] = useState('');
  const [bodyWeight, setBodyWeight] = useState(false);
  const [duration, setDuration] = useState('');
  const [personalBest, setPersonalBest] = useState('');

  useEffect(() => {
    if (defaults && visible) {
      setSets(defaults.sets != null ? String(defaults.sets) : '');
      setReps(defaults.reps ?? '');
      setWorkingWeight(defaults.workingWeight != null ? String(defaults.workingWeight) : '');
      setBodyWeight(defaults.bodyWeight ?? false);
      setDuration(defaults.duration ?? '');
      setPersonalBest(defaults.personalBest != null ? String(defaults.personalBest) : '');
    }
  }, [defaults, visible]);

  if (!exercise) return null;

  const isTime = exercise.type === 'time';
  const parsedSets = parseInt(sets, 10);
  const setsValid = !isNaN(parsedSets) && parsedSets >= 1;

  function handleSave() {
    const parsedSets = parseInt(sets, 10);
    if (isNaN(parsedSets) || parsedSets < 1) return;

    const updated: ExerciseDefaults = { sets: parsedSets };

    if (isTime) {
      updated.duration = duration.trim() || undefined;
      const pb = parseFloat(personalBest);
      updated.personalBest = isNaN(pb) ? undefined : pb;
    } else {
      updated.reps = reps.trim() || undefined;
      updated.bodyWeight = bodyWeight || undefined;
      const ww = parseFloat(workingWeight);
      updated.workingWeight = bodyWeight ? undefined : (isNaN(ww) ? undefined : ww);
    }

    onSave(updated);
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
              <Text style={[Typography.h2, { color: colors.text }]}>{exercise.name}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Sets */}
            <Field label="Sets">
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={sets}
                onChangeText={setSets}
                keyboardType="number-pad"
                placeholder="e.g. 4"
                placeholderTextColor={colors.textSecondary}
              />
            </Field>

            {isTime ? (
              <>
                <Field label="Duration per set">
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                    value={duration}
                    onChangeText={setDuration}
                    placeholder="e.g. 60s"
                    placeholderTextColor={colors.textSecondary}
                  />
                </Field>
                <Field label={`Personal best (seconds)`}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                    value={personalBest}
                    onChangeText={setPersonalBest}
                    keyboardType="decimal-pad"
                    placeholder="e.g. 90"
                    placeholderTextColor={colors.textSecondary}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Reps">
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                    value={reps}
                    onChangeText={setReps}
                    placeholder="e.g. 8-12"
                    placeholderTextColor={colors.textSecondary}
                  />
                </Field>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setBodyWeight((v) => !v)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, { borderColor: colors.primary, backgroundColor: bodyWeight ? colors.primary : 'transparent' }]}>
                    {bodyWeight && <Ionicons name="checkmark" size={14} color={colors.white} />}
                  </View>
                  <Text style={[Typography.body, { color: colors.text }]}>Body weight exercise</Text>
                </TouchableOpacity>

                <Field label={`Working weight (${unit})`}>
                  <TextInput
                    style={[styles.input, { backgroundColor: bodyWeight ? colors.border : colors.card, borderColor: colors.border, color: bodyWeight ? colors.textSecondary : colors.text }]}
                    value={bodyWeight ? '' : workingWeight}
                    onChangeText={setWorkingWeight}
                    keyboardType="decimal-pad"
                    placeholder={bodyWeight ? 'Body weight' : 'e.g. 135'}
                    placeholderTextColor={colors.textSecondary}
                    editable={!bodyWeight}
                  />
                </Field>
              </>
            )}

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: setsValid ? colors.primary : colors.border }]}
              onPress={handleSave}
              disabled={!setsValid}
            >
              <Text style={[Typography.body, { color: colors.white, fontWeight: '600' }]}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={fieldStyles.wrap}>
      <Text style={[Typography.small, { color: colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' }]}>
        {label.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: Spacing.md },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    height: 50,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
});
