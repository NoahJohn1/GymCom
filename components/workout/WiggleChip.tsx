import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../constants/theme';
import { formatPresetLabel } from '../../utils/formatPresetLabel';
import { TimerPreset } from '../../types';

const CHIP_SIZE = 60;
const BADGE_SIZE = 22;

interface WiggleChipProps {
  preset: TimerPreset;
  isWiggling: boolean;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function WiggleChip({
  preset,
  isWiggling,
  isSelected,
  onPress,
  onLongPress,
  onDelete,
  onEdit,
}: WiggleChipProps) {
  const colors = useColors();
  const rotation = useSharedValue(0);
  const delay = useRef(Math.random() * 150).current;

  useEffect(() => {
    if (isWiggling) {
      rotation.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-4, { duration: 80 }),
            withTiming(4, { duration: 80 }),
          ),
          -1,
          true
        )
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = withTiming(0, { duration: 120 });
    }
  }, [isWiggling]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const borderColor = isSelected ? colors.primary : isWiggling ? colors.border : 'transparent';

  return (
    <Animated.View style={[animatedStyle, styles.wrapper]}>
      <TouchableOpacity
        style={[
          styles.chip,
          {
            backgroundColor: colors.primaryLight,
            borderColor,
            borderWidth: 2,
          },
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.75}
      >
        <Text
          style={[styles.chipText, { color: colors.primary }]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {formatPresetLabel(preset.seconds)}
        </Text>
      </TouchableOpacity>

      {isWiggling && (
        <>
          {/* Delete badge — top-left */}
          <TouchableOpacity
            style={[styles.badge, styles.badgeTopLeft, { backgroundColor: colors.danger }]}
            onPress={onDelete}
            hitSlop={4}
          >
            <Ionicons name="close" size={13} color={colors.white} />
          </TouchableOpacity>

          {/* Edit badge — bottom-right */}
          <TouchableOpacity
            style={[styles.badge, styles.badgeBottomRight, { backgroundColor: colors.textSecondary }]}
            onPress={onEdit}
            hitSlop={4}
          >
            <Ionicons name="pencil" size={11} color={colors.white} />
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
  },
  chip: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: CHIP_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
  },
  badge: {
    position: 'absolute',
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTopLeft: {
    top: -2,
    left: -2,
  },
  badgeBottomRight: {
    bottom: -2,
    right: -2,
  },
});
