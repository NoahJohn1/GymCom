import { useAudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

const SOUND_PREF_KEY = 'timer_sound_enabled';
const SOUND_SOURCE = require('../assets/sounds/timer-done.mp3');

export function useTimerSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const player = useAudioPlayer(SOUND_SOURCE);

  useEffect(() => {
    AsyncStorage.getItem(SOUND_PREF_KEY).then((val) => {
      if (val !== null) setSoundEnabled(val === 'true');
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      AsyncStorage.setItem(SOUND_PREF_KEY, String(next));
      return next;
    });
  }, []);

  const playDoneSound = useCallback(() => {
    if (!soundEnabled) return;
    player.seekTo(0).then(() => player.play());
  }, [soundEnabled, player]);

  return { soundEnabled, toggleSound, playDoneSound };
}
