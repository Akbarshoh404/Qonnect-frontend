import type { TargetAndTransition, Transition } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

export const premiumEase = [0.16, 1, 0.3, 1] as const;

export const quickTransition: Transition = {
  duration: 0.16,
  ease: premiumEase,
};

export const standardTransition: Transition = {
  duration: 0.24,
  ease: premiumEase,
};

export const gentleTransition: Transition = {
  duration: 0.32,
  ease: premiumEase,
};

export type MotionState = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit?: TargetAndTransition;
};

export const pageEnterMotion: MotionState = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const fadeUpMotion: MotionState = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export const fadeInMotion: MotionState = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const popoverMotion: MotionState = {
  initial: { opacity: 0, y: 6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.98 },
};

export const stepForwardMotion: MotionState = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

export const stepBackwardMotion: MotionState = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
};

export function usePremiumMotion() {
  const reduceMotion = useReducedMotion();

  return {
    reduceMotion,
    page: reduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
      : pageEnterMotion,
    fadeUp: reduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
      : fadeUpMotion,
    popover: reduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
      : popoverMotion,
    stepForward: reduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
      : stepForwardMotion,
    stepBackward: reduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
      : stepBackwardMotion,
    transition: reduceMotion ? { duration: 0 } : standardTransition,
    quickTransition: reduceMotion ? { duration: 0 } : quickTransition,
  };
}
