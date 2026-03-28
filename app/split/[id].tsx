import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useApp } from '../../context/AppContext';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { WorkoutDayRow } from '../../components/plans/WorkoutDayRow';
import { Workout } from '../../types';
import { generateId } from '../../utils/generateId';

export default function SplitDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { splits, workouts, dispatch } = useApp();

  const split = splits.find((s) => s.id === id);
  const splitWorkouts = split
    ? split.workoutIds.map((wid) => workouts.find((w) => w.id === wid)).filter(Boolean) as Workout[]
    : [];

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [addDayModalVisible, setAddDayModalVisible] = useState(false);
  const [dayNameDraft, setDayNameDraft] = useState('');

  if (!split) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.xl }]}>
          Split not found.
        </Text>
      </SafeAreaView>
    );
  }

  function handleAddDay() {
    setDayNameDraft('');
    setAddDayModalVisible(true);
  }

  function confirmAddDay() {
    const name = dayNameDraft.trim();
    if (!name || !split) return;
    const workout: Workout = {
      id: generateId(),
      name,
      splitId: split.id,
      exerciseSlots: [],
    };
    dispatch({ type: 'ADD_WORKOUT', workout });
    dispatch({
      type: 'UPDATE_SPLIT',
      split: { ...split, workoutIds: [...split.workoutIds, workout.id] },
    });
    setAddDayModalVisible(false);
  }

  function handleDeleteWorkout(workoutId: string) {
    Alert.alert('Delete Day', 'Remove this workout day?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_WORKOUT', id: workoutId }) },
    ]);
  }

  function handleDragEnd({ data }: { data: Workout[] }) {
    if (!split) return;
    dispatch({ type: 'UPDATE_SPLIT', split: { ...split, workoutIds: data.map((w) => w.id) } });
  }

  function startTitleEdit() {
    setTitleDraft(split!.name);
    setEditingTitle(true);
  }

  function commitTitleEdit() {
    const trimmed = titleDraft.trim();
    if (trimmed && split) {
      dispatch({ type: 'UPDATE_SPLIT', split: { ...split, name: trimmed } });
    }
    setEditingTitle(false);
  }

  function renderItem({ item, drag, isActive }: RenderItemParams<Workout>) {
    return (
      <WorkoutDayRow
        workout={item}
        drag={drag}
        isActive={isActive}
        onPress={() => router.push(`/workout/${item.id}`)}
        onDelete={() => handleDeleteWorkout(item.id)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: split.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      {/* Editable title area */}
      <View style={styles.titleRow}>
        {editingTitle ? (
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
            <Text style={[Typography.h1, { color: colors.text, flex: 1 }]}>{split.name}</Text>
            <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <DraggableFlatList
        data={splitWorkouts}
        keyExtractor={(item) => item.id}
        onDragEnd={handleDragEnd}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
            <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.md }]}>
              No days yet.{'\n'}Tap + to add your first training day.
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddDay}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Add day modal */}
      <Modal
        visible={addDayModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddDayModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
              New Workout Day
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder='e.g. Push Day, Pull Day...'
              placeholderTextColor={colors.textSecondary}
              value={dayNameDraft}
              onChangeText={setDayNameDraft}
              autoFocus
              onSubmitEditing={confirmAddDay}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border }]}
                onPress={() => setAddDayModalVisible(false)}
              >
                <Text style={[Typography.body, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: dayNameDraft.trim() ? colors.primary : colors.border }]}
                onPress={confirmAddDay}
                disabled={!dayNameDraft.trim()}
              >
                <Text style={[Typography.body, { color: colors.white, fontWeight: '600' }]}>Add Day</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnPrimary: {
    borderWidth: 0,
  },
});
