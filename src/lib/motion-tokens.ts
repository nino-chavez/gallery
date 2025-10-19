/**
 * Motion Design Tokens
 *
 * Consistent animation configuration for Framer Motion / svelte-motion
 * Reference: agent-os/product/design-brief.md
 */

export const MOTION = {
  spring: {
    // Smooth, natural springs for general UI interactions
    gentle: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
    // Quick, responsive for button/card interactions
    snappy: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
    // Playful bounce for celebratory moments
    bouncy: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 25,
    },
  },
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
  },
  ease: {
    easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
    easeInOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  },
};

/**
 * Emotion Palette
 *
 * Used for halos, timeline, cursor glow, ambient lighting
 */
export const EMOTION_PALETTE: Record<string, { color: string; gradient: string; glow: string }> = {
  triumph: {
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    glow: 'rgba(255, 215, 0, 0.4)',
  },
  intensity: {
    color: '#FF4500',
    gradient: 'linear-gradient(135deg, #FF4500 0%, #DC143C 100%)',
    glow: 'rgba(255, 69, 0, 0.4)',
  },
  focus: {
    color: '#4169E1',
    gradient: 'linear-gradient(135deg, #4169E1 0%, #1E90FF 100%)',
    glow: 'rgba(65, 105, 225, 0.4)',
  },
  determination: {
    color: '#8B008B',
    gradient: 'linear-gradient(135deg, #8B008B 0%, #9370DB 100%)',
    glow: 'rgba(139, 0, 139, 0.4)',
  },
  excitement: {
    color: '#FF69B4',
    gradient: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)',
    glow: 'rgba(255, 105, 180, 0.4)',
  },
  serenity: {
    color: '#20B2AA',
    gradient: 'linear-gradient(135deg, #20B2AA 0%, #48D1CC 100%)',
    glow: 'rgba(32, 178, 170, 0.4)',
  },
};
