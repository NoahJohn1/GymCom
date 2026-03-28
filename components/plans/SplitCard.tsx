import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { Split } from '../../types';

interface SplitCardProps {
  split: Split;
  workoutCount: number;
  onPress: () => void;
  onDelete: () => void;
}

export function SplitCard({ split, workoutCount, onPress, onDelete }: SplitCardProps) {
  const colors = useColors();

  function renderRightActions(
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: colors.danger }]}
        onPress={onDelete}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={22} color={colors.white} />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <Text style={[Typography.h3, { color: colors.text }]}>{split.name}</Text>
          {split.description ? (
            <Text style={[Typography.small, { color: colors.textSecondary }]} numberOfLines={1}>
              {split.description}
            </Text>
          ) : null}
          <Text style={[Typography.small, { color: colors.textSecondary }]}>
            {workoutCount} {workoutCount === 1 ? 'day' : 'days'}
          </Text>
        </View>

        <Ionicons name="chevron-forward-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    minHeight: 64,
  },
  content: { flex: 1, gap: Spacing.xs, paddingVertical: Spacing.md },
  deleteAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
});
