import { Platform } from 'react-native';

/**
 * Cross-platform shadow.
 * - Native: uses shadowColor / shadowOpacity / shadowRadius / elevation
 * - Web:    uses boxShadow (React Native Web compatible)
 */
export function shadow(
  color: string,
  opacity: number,
  radius: number,
  elevation: number,
  offsetY = 4,
) {
  if (Platform.OS === 'web') {
    return { boxShadow: `0 ${offsetY}px ${radius}px rgba(0,0,0,${opacity})` } as any;
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}

/**
 * Cross-platform text shadow.
 * - Native: uses textShadowColor / textShadowOffset / textShadowRadius
 * - Web:    uses textShadow CSS string
 */
export function textShadow(color: string, opacity: number, radius: number) {
  if (Platform.OS === 'web') {
    return { textShadow: `0 1px ${radius}px rgba(0,0,0,${opacity})` } as any;
  }
  return {
    textShadowColor: color,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: radius,
  };
}
