import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useRef } from 'react';

const SOUND_PREF_KEY = 'timer_sound_enabled';
const SOUND_SOURCE = require('../assets/sounds/timer_done.mp3');

export function useTimerSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const player = useAudioPlayer(SOUND_SOURCE);
  const status = useAudioPlayerStatus(player);
  const isDuckingRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(SOUND_PREF_KEY).then((val) => {
      if (val !== null) setSoundEnabled(val === 'true');
    });
  }, []);

  // Restore audio mode once the alert sound finishes
  useEffect(() => {
    if (status.didJustFinish && isDuckingRef.current) {
      isDuckingRef.current = false;
      setAudioModeAsync({ interruptionMode: 'mixWithOthers' }).catch(() => {});
    }
  }, [status.didJustFinish]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      AsyncStorage.setItem(SOUND_PREF_KEY, String(next));
      return next;
    });
  }, []);

  const playDoneSound = useCallback(async () => {
    if (!soundEnabled) return;
    await setAudioModeAsync({ interruptionMode: 'duckOthers' }).catch(() => {});
    isDuckingRef.current = true;
    await player.seekTo(0);
    player.play();
  }, [soundEnabled, player]);

  return { soundEnabled, toggleSound, playDoneSound };
}
