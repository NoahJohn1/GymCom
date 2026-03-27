import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { SplitCard } from '../../components/plans/SplitCard';
import { Split, Workout } from '../../types';
import { generateId } from '../../utils/generateId';

export default function PlansScreen() {
  const colors = useColors();
  const router = useRouter();
  const { splits, workouts, preferences, dispatch } = useApp();

  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const [addDayModalVisible, setAddDayModalVisible] = useState(false);
  const [dayNameDraft, setDayNameDraft] = useState('');

  const activeSplit = splits.find((s) => s.id === preferences.activeSplitId);
  const activeSplitWorkouts = activeSplit
    ? activeSplit.workoutIds
        .map((wid) => workouts.find((w) => w.id === wid))
        .filter(Boolean) as Workout[]
    : [];

  // ── Split creation ──

  function handleCreateSplit() {
    setNameDraft('');
    setNameModalVisible(true);
  }

  function confirmCreateSplit() {
    const name = nameDraft.trim();
    if (!name) return;
    const newSplit: Split = {
      id: generateId(),
      name,
      workoutIds: [],
    };
    dispatch({ type: 'ADD_SPLIT', split: newSplit });
    dispatch({ type: 'SET_PREFERENCES', preferences: { activeSplitId: newSplit.id } });
    setNameModalVisible(false);
  }

  // ── Split deletion ──

  function handleDeleteSplit(id: string) {
    Alert.alert('Delete Split', 'This will delete the split and all its workout days. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'DELETE_SPLIT', id });
          if (preferences.activeSplitId === id) {
            dispatch({ type: 'SET_PREFERENCES', preferences: { activeSplitId: undefined } });
          }
        },
      },
    ]);
  }

  // ── Split switching ──

  function selectSplit(splitId: string) {
    dispatch({ type: 'SET_PREFERENCES', preferences: { activeSplitId: splitId } });
    setSwitcherVisible(false);
  }

  // ── Add workout day ──

  function handleAddDay() {
    setDayNameDraft('');
    setAddDayModalVisible(true);
  }

  function confirmAddDay() {
    const name = dayNameDraft.trim();
    if (!name || !activeSplit) return;
    const workout: Workout = {
      id: generateId(),
      name,
      splitId: activeSplit.id,
      exerciseSlots: [],
    };
    dispatch({ type: 'ADD_WORKOUT', workout });
    dispatch({
      type: 'UPDATE_SPLIT',
      split: { ...activeSplit, workoutIds: [...activeSplit.workoutIds, workout.id] },
    });
    setAddDayModalVisible(false);
  }

  // ── Active split view ──

  function renderActiveSplitView() {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Split switcher */}
        <TouchableOpacity
          style={[styles.switcher, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setSwitcherVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[Typography.h3, { color: colors.text, flex: 1 }]}>{activeSplit!.name}</Text>
          <Ionicons name="chevron-down-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Workout days */}
        {activeSplitWorkouts.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
            <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.md }]}>
              No workout days yet.{'\n'}Tap below to add your first day.
            </Text>
          </View>
        ) : (
          activeSplitWorkouts.map((workout) => {
            const count = workout.exerciseSlots.length;
            return (
              <TouchableOpacity
                key={workout.id}
                style={[styles.dayRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/workout/${workout.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.dayContent}>
                  <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>{workout.name}</Text>
                  <Text style={[Typography.small, { color: colors.textSecondary }]}>
                    {count} {count === 1 ? 'exercise' : 'exercises'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })
        )}

        {/* Add Day + Manage Split buttons */}
        <TouchableOpacity
          style={[styles.addDayBtn, { borderColor: colors.primary }]}
          onPress={handleAddDay}
        >
          <Ionicons name="add-outline" size={20} color={colors.primary} />
          <Text style={[Typography.body, { color: colors.primary, fontWeight: '600' }]}>Add Day</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.manageBtn]}
          onPress={() => router.push(`/split/${activeSplit!.id}`)}
        >
          <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
          <Text style={[Typography.small, { color: colors.textSecondary }]}>Manage Split</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Fallback split list ──

  function renderSplitList() {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {splits.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="barbell-outline" size={48} color={colors.textSecondary} />
            <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.md }]}>
              No training splits yet.{'\n'}Create one to get started.
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary, marginTop: Spacing.lg }]}
              onPress={handleCreateSplit}
            >
              <Text style={[Typography.body, { color: colors.white, fontWeight: '600' }]}>+ New Split</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[Typography.small, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>
              Select a split to set as active
            </Text>
            {splits.map((split) => {
              const workoutCount = workouts.filter((w) => w.splitId === split.id).length;
              return (
                <SplitCard
                  key={split.id}
                  split={split}
                  workoutCount={workoutCount}
                  onPress={() => selectSplit(split.id)}
                  onDelete={() => handleDeleteSplit(split.id)}
                />
              );
            })}
            <TouchableOpacity
              style={[styles.newSplitRow, { borderColor: colors.primary, marginTop: Spacing.xs }]}
              onPress={handleCreateSplit}
            >
              <Ionicons name="add-outline" size={20} color={colors.primary} />
              <Text style={[Typography.body, { color: colors.primary, fontWeight: '600' }]}>New Split</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {activeSplit ? renderActiveSplitView() : renderSplitList()}

      {/* ── Name prompt modal (new split) ── */}
      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
              New Training Split
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. PPL, Upper/Lower..."
              placeholderTextColor={colors.textSecondary}
              value={nameDraft}
              onChangeText={setNameDraft}
              autoFocus
              onSubmitEditing={confirmCreateSplit}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border }]}
                onPress={() => setNameModalVisible(false)}
              >
                <Text style={[Typography.body, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: nameDraft.trim() ? colors.primary : colors.border }]}
                onPress={confirmCreateSplit}
                disabled={!nameDraft.trim()}
              >
                <Text style={[Typography.body, { color: colors.white, fontWeight: '600' }]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Split switcher modal ── */}
      <Modal
        visible={switcherVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSwitcherVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSwitcherVisible(false)}
        >
          <View style={[styles.switcherCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
              Switch Split
            </Text>
            <FlatList
              data={splits}
              keyExtractor={(item) => item.id}
              style={styles.switcherList}
              renderItem={({ item }) => {
                const isActive = item.id === preferences.activeSplitId;
                return (
                  <TouchableOpacity
                    style={[
                      styles.switcherRow,
                      { borderColor: isActive ? colors.primary : colors.border },
                      isActive && { backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => selectSplit(item.id)}
                  >
                    <Text style={[Typography.body, { color: colors.text, fontWeight: isActive ? '700' : '400', flex: 1 }]}>
                      {item.name}
                    </Text>
                    {isActive && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={[styles.newSplitRow, { borderColor: colors.primary }]}
              onPress={() => { setSwitcherVisible(false); handleCreateSplit(); }}
            >
              <Ionicons name="add-outline" size={20} color={colors.primary} />
              <Text style={[Typography.body, { color: colors.primary, fontWeight: '600' }]}>New Split</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Add day modal ── */}
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
              placeholder="e.g. Push Day, Pull Day..."
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
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xl },
  createButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    minHeight: 36,
  },

  // ── Split switcher ──
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },

  // ── Workout day rows ──
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dayContent: { flex: 1, gap: Spacing.xs },

  // ── Add Day button ──
  addDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },

  // ── Manage Split link ──
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },

  // ── Empty state ──
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xl * 2,
  },

  // ── Modal shared ──
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

  // ── Switcher modal ──
  switcherCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    maxHeight: '60%',
  },
  switcherList: {
    flexGrow: 0,
  },
  switcherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  newSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
});
