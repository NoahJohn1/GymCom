import { useEffect } from "react";
import { useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { DEFAULT_ANIMATION_CONFIG } from "../constants";
import { useAnimatedValues } from "../context/animatedValueContext";
import { useIsActive } from "../context/cellContext";
export function useOnCellActiveAnimation() {
  let {
    animationConfig
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    animationConfig: {}
  };
  const animationConfigRef = useSharedValue(animationConfig);
  useEffect(() => {
    animationConfigRef.value = animationConfig;
  }, [animationConfig]);
  const isActive = useIsActive();
  const {
    isTouchActiveNative
  } = useAnimatedValues();
  const onActiveAnim = useDerivedValue(() => {
    const toVal = isActive && isTouchActiveNative.value ? 1 : 0;
    return withSpring(toVal, { ...DEFAULT_ANIMATION_CONFIG,
      ...animationConfigRef.value
    });
  }, [isActive]);
  return {
    isActive,
    onActiveAnim
  };
}
//# sourceMappingURL=useOnCellActiveAnimation.js.map