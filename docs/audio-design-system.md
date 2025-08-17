# Audio Design System

## Overview
Therapeutic audio design principles for PocketTherapy, focusing on calming, supportive soundscapes that enhance mental health exercises without causing anxiety or overstimulation.

## Design Philosophy

### Core Principles
1. **Calming First**: All audio reduces anxiety, never startles or overwhelms
2. **Optional by Default**: Users control all audio experiences
3. **Therapeutic Purpose**: Every sound serves a mental health function
4. **Accessibility Aware**: Compatible with hearing aids and assistive devices
5. **Crisis-Safe**: No jarring sounds that could worsen panic states

### Audio Goals
- **Reduce Anxiety**: Gentle, predictable audio patterns
- **Enhance Focus**: Ambient sounds that aid concentration
- **Guide Breathing**: Audio cues synchronized with therapeutic exercises
- **Celebrate Progress**: Positive reinforcement through sound
- **Support Accessibility**: Audio alternatives for visual content

## Sound Categories

### 1. Ambient Background Sounds
```typescript
const ambientSounds = {
  rain: {
    file: 'gentle-rain-loop.wav',
    duration: 'loop',
    volume: -15, // LUFS
    purpose: 'Focus aid during exercises',
    frequency: '20Hz-8kHz', // Gentle frequency range
    fadeIn: 2000, // 2 second fade-in
    fadeOut: 3000 // 3 second fade-out
  },
  
  ocean: {
    file: 'ocean-waves-loop.wav',
    duration: 'loop',
    volume: -12,
    purpose: 'Breathing exercise background',
    frequency: '30Hz-6kHz',
    fadeIn: 2000,
    fadeOut: 3000
  },
  
  forest: {
    file: 'forest-ambience-loop.wav',
    duration: 'loop',
    volume: -14,
    purpose: 'Grounding exercise support',
    frequency: '40Hz-10kHz',
    fadeIn: 2000,
    fadeOut: 3000
  },
  
  whiteNoise: {
    file: 'pink-noise-loop.wav',
    duration: 'loop',
    volume: -18,
    purpose: 'Sleep and relaxation',
    frequency: '20Hz-20kHz',
    fadeIn: 3000,
    fadeOut: 5000
  }
};
```

### 2. Interaction Feedback Sounds
```typescript
const feedbackSounds = {
  // Gentle confirmations
  softChime: {
    file: 'marimba-soft.wav',
    duration: 800, // milliseconds
    volume: -10,
    purpose: 'Confirm positive actions',
    trigger: ['mood_logged', 'exercise_started', 'settings_saved']
  },
  
  // Breathing guidance
  breatheIn: {
    file: 'synth-rise.wav',
    duration: 4000, // 4 seconds for 4-7-8 breathing
    volume: -12,
    purpose: 'Guide inhalation phase',
    frequency: '200Hz-1kHz' // Rising tone
  },
  
  breatheOut: {
    file: 'synth-fall.wav',
    duration: 8000, // 8 seconds for 4-7-8 breathing
    volume: -12,
    purpose: 'Guide exhalation phase',
    frequency: '1kHz-200Hz' // Falling tone
  },
  
  // Celebration sounds
  streakCelebration: {
    file: 'harp-arpeggio.wav',
    duration: 1500,
    volume: -8,
    purpose: 'Celebrate consistency milestones',
    trigger: ['streak_milestone', 'exercise_completion']
  }
};
```

### 3. Crisis Support Audio
```typescript
const crisisSupportAudio = {
  // Immediate calming
  groundingTone: {
    file: 'grounding-pulse.wav',
    duration: 'loop',
    volume: -15,
    purpose: 'Immediate anxiety relief',
    pattern: 'slow_pulse', // 60 BPM to slow heart rate
    frequency: '100Hz-500Hz' // Low, calming frequencies
  },
  
  // Breathing guidance for panic
  panicBreathing: {
    file: 'panic-breathing-guide.wav',
    duration: 'loop',
    volume: -10,
    purpose: 'Guide breathing during panic attacks',
    pattern: '4-7-8_breathing',
    voiceGuidance: true // Optional voice instructions
  },
  
  // Safety affirmations
  safetyAffirmations: {
    file: 'safety-affirmations.wav',
    duration: 'variable',
    volume: -12,
    purpose: 'Provide reassuring voice guidance',
    language: 'multiple', // Support multiple languages
    voice: 'calm_female' // Research-backed calming voice
  }
};
```

### 4. Voice Guidance
```typescript
const voiceGuidance = {
  // Exercise instructions
  exerciseInstructions: {
    breathingExercise: {
      file: 'breathing-instructions.wav',
      voice: 'calm_neutral',
      pace: 'slow', // 120 words per minute
      tone: 'supportive',
      language: ['en', 'es', 'hi'] // Multi-language support
    },
    
    groundingExercise: {
      file: 'grounding-instructions.wav',
      voice: 'calm_neutral',
      pace: 'slow',
      tone: 'gentle',
      language: ['en', 'es', 'hi']
    }
  },
  
  // Crisis support
  crisisSupport: {
    file: 'crisis-voice-support.wav',
    voice: 'calm_female',
    pace: 'very_slow', // 100 words per minute
    tone: 'reassuring',
    content: 'safety_affirmations'
  }
};
```

## Technical Specifications

### Audio File Standards
```typescript
const audioFileSpecs = {
  format: {
    primary: 'WAV', // Uncompressed for quality
    fallback: 'MP3', // Compressed for bandwidth
    bitRate: '320kbps', // High quality MP3
    sampleRate: '44.1kHz', // CD quality
    bitDepth: '16-bit' // Standard depth
  },
  
  fileSize: {
    maxSize: '200KB', // Per file for performance
    ambientLoops: '500KB', // Longer files allowed
    voiceGuidance: '1MB' // Longer voice files
  },
  
  loudness: {
    target: '-12 LUFS', // Consistent loudness
    range: '-15 to -8 LUFS', // Acceptable range
    peak: '-3 dBFS', // Prevent clipping
    measurement: 'integrated' // LUFS measurement type
  }
};
```

### Audio Processing
```typescript
const audioProcessing = {
  // Frequency filtering
  frequencyLimits: {
    lowCut: '20Hz', // Remove sub-bass rumble
    highCut: '12kHz', // Gentle high-frequency limit
    avoidRange: '2-4kHz' // Avoid harsh frequencies
  },
  
  // Dynamic range
  dynamicRange: {
    compression: 'gentle', // Light compression only
    ratio: '2:1', // Mild compression ratio
    attack: '10ms', // Slow attack
    release: '100ms' // Gentle release
  },
  
  // Loop optimization
  loopPoints: {
    seamless: true, // Perfect loop points
    crossfade: '500ms', // Smooth transitions
    analysis: 'spectral' // Spectral analysis for perfect loops
  }
};
```

## Implementation Guidelines

### React Native Audio Setup
```typescript
import { Audio } from 'expo-av';

const audioConfig = {
  // Audio session configuration
  audioSession: {
    category: 'playback',
    options: [
      'mixWithOthers', // Allow other apps' audio
      'duckOthers', // Lower other apps' volume
      'allowBluetooth', // Support Bluetooth devices
      'allowAirPlay' // Support AirPlay
    ]
  },
  
  // Playback configuration
  playbackConfig: {
    shouldDuckAndroid: true, // Duck other audio on Android
    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX
  }
};
```

### Audio State Management
```typescript
const audioState = {
  // Global audio settings
  globalSettings: {
    masterVolume: 0.7, // 70% default volume
    audioEnabled: true, // User preference
    backgroundSoundsEnabled: false, // Opt-in
    voiceGuidanceEnabled: false, // Opt-in
    hapticSyncEnabled: true // Sync with haptics
  },
  
  // Current playback
  currentPlayback: {
    ambientSound: null,
    feedbackSounds: [],
    voiceGuidance: null,
    fadingOut: []
  },
  
  // Audio preferences
  userPreferences: {
    preferredAmbientSound: 'none',
    voiceGuidanceLanguage: 'en',
    audioQuality: 'high', // high, medium, low
    offlineAudioEnabled: true
  }
};
```

### Accessibility Integration
```typescript
const audioAccessibility = {
  // Hearing aid compatibility
  hearingAidSupport: {
    frequencyOptimization: true, // Optimize for hearing aids
    volumeBoost: 'available', // Optional volume boost
    clarityEnhancement: true // Enhance speech clarity
  },
  
  // Visual alternatives
  visualAlternatives: {
    breathingCircle: 'replaces_breathing_audio',
    progressIndicators: 'replace_feedback_sounds',
    textInstructions: 'replace_voice_guidance'
  },
  
  // Reduced audio mode
  reducedAudioMode: {
    essentialOnly: true, // Only critical audio
    noAmbientSounds: true, // Disable background audio
    shortenedFeedback: true // Shorter feedback sounds
  }
};
```

## User Controls

### Audio Settings Interface
```typescript
const audioSettingsUI = {
  // Master controls
  masterControls: {
    audioEnabled: 'toggle', // Global audio on/off
    masterVolume: 'slider', // 0-100% volume
    audioQuality: 'picker' // High/Medium/Low
  },
  
  // Category controls
  categoryControls: {
    backgroundSounds: {
      enabled: 'toggle',
      volume: 'slider',
      soundSelection: 'picker' // Rain, Ocean, Forest, etc.
    },
    feedbackSounds: {
      enabled: 'toggle',
      volume: 'slider'
    },
    voiceGuidance: {
      enabled: 'toggle',
      volume: 'slider',
      language: 'picker',
      voice: 'picker' // Male/Female/Neutral
    }
  },
  
  // Advanced settings
  advancedSettings: {
    hearingAidMode: 'toggle',
    reducedAudioMode: 'toggle',
    offlineAudioDownload: 'toggle'
  }
};
```

## Performance Optimization

### Audio Loading Strategy
```typescript
const audioLoadingStrategy = {
  // Preloading
  preload: [
    'soft-chime.wav', // Frequently used
    'grounding-pulse.wav', // Crisis support
    'breathing-guide.wav' // Core feature
  ],
  
  // Lazy loading
  lazyLoad: [
    'ambient-loops', // Load on demand
    'voice-guidance', // Load when enabled
    'celebration-sounds' // Load when needed
  ],
  
  // Caching
  caching: {
    strategy: 'LRU', // Least Recently Used
    maxSize: '10MB', // Cache size limit
    persistence: 'session' // Cache duration
  }
};
```

This audio design system ensures PocketTherapy provides therapeutic, accessible, and high-quality audio experiences that support users' mental health journey while respecting their preferences and device capabilities.
