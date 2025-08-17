/**
 * Exercise Content Database
 * 
 * 30 micro-exercises for breathing, grounding, and cognitive support
 * Each exercise is designed for 1-5 minute sessions with clear instructions
 */

export interface Exercise {
  id: string;
  title: string;
  category: 'breathing' | 'grounding' | 'cognitive';
  duration: number; // in seconds
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  instructions: string[];
  benefits: string[];
  tags: string[];
  audioScript?: string;
  hapticPattern?: 'gentle' | 'rhythmic' | 'calming';
  crisisAppropriate: boolean;
}

export const exercises: Exercise[] = [
  // BREATHING EXERCISES (10)
  {
    id: 'breathing-001',
    title: '4-7-8 Calming Breath',
    category: 'breathing',
    duration: 120,
    difficulty: 'beginner',
    description: 'A simple breathing technique to reduce anxiety and promote relaxation.',
    instructions: [
      'Sit comfortably with your back straight',
      'Place the tip of your tongue against the ridge behind your upper teeth',
      'Exhale completely through your mouth',
      'Close your mouth and inhale through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Exhale through your mouth for 8 counts',
      'Repeat this cycle 3-4 times'
    ],
    benefits: ['Reduces anxiety', 'Promotes sleep', 'Calms nervous system'],
    tags: ['anxiety', 'sleep', 'quick'],
    hapticPattern: 'rhythmic',
    crisisAppropriate: true
  },
  {
    id: 'breathing-002',
    title: 'Box Breathing',
    category: 'breathing',
    duration: 180,
    difficulty: 'beginner',
    description: 'Equal-count breathing to center your mind and reduce stress.',
    instructions: [
      'Sit with your feet flat on the floor',
      'Inhale slowly through your nose for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale slowly through your mouth for 4 counts',
      'Hold empty for 4 counts',
      'Repeat for 6-8 cycles',
      'Focus on the rhythm and counting'
    ],
    benefits: ['Improves focus', 'Reduces stress', 'Balances nervous system'],
    tags: ['focus', 'stress', 'concentration'],
    hapticPattern: 'rhythmic',
    crisisAppropriate: true
  },
  {
    id: 'breathing-003',
    title: 'Belly Breathing',
    category: 'breathing',
    duration: 240,
    difficulty: 'beginner',
    description: 'Deep diaphragmatic breathing to activate your body\'s relaxation response.',
    instructions: [
      'Lie down or sit comfortably',
      'Place one hand on your chest, one on your belly',
      'Breathe in slowly through your nose',
      'Feel your belly rise while your chest stays still',
      'Exhale slowly through pursed lips',
      'Feel your belly fall gently',
      'Continue for 3-4 minutes'
    ],
    benefits: ['Deep relaxation', 'Reduces tension', 'Improves oxygen flow'],
    tags: ['relaxation', 'tension', 'deep'],
    hapticPattern: 'gentle',
    crisisAppropriate: true
  },
  {
    id: 'breathing-004',
    title: 'Coherent Breathing',
    category: 'breathing',
    duration: 300,
    difficulty: 'intermediate',
    description: 'Balanced breathing at 5 breaths per minute for heart rate variability.',
    instructions: [
      'Sit comfortably with eyes closed',
      'Breathe in for 6 counts',
      'Breathe out for 6 counts',
      'Maintain this rhythm without pausing',
      'Focus on smooth, even breaths',
      'Continue for 5 minutes',
      'Notice the calming effect'
    ],
    benefits: ['Heart rate balance', 'Emotional regulation', 'Mental clarity'],
    tags: ['balance', 'heart', 'regulation'],
    hapticPattern: 'rhythmic',
    crisisAppropriate: false
  },
  {
    id: 'breathing-005',
    title: 'Alternate Nostril Breathing',
    category: 'breathing',
    duration: 180,
    difficulty: 'intermediate',
    description: 'Traditional pranayama technique to balance the nervous system.',
    instructions: [
      'Sit with your spine straight',
      'Use your right thumb to close your right nostril',
      'Inhale through your left nostril for 4 counts',
      'Close left nostril with ring finger',
      'Release thumb and exhale right for 4 counts',
      'Inhale right for 4 counts',
      'Switch and exhale left for 4 counts',
      'Complete 5-8 rounds'
    ],
    benefits: ['Balances nervous system', 'Improves focus', 'Reduces stress'],
    tags: ['balance', 'traditional', 'focus'],
    hapticPattern: 'gentle',
    crisisAppropriate: false
  },
  {
    id: 'breathing-006',
    title: 'Counted Breath',
    category: 'breathing',
    duration: 120,
    difficulty: 'beginner',
    description: 'Simple counting meditation to anchor your attention.',
    instructions: [
      'Sit quietly and close your eyes',
      'Breathe naturally without forcing',
      'Count "1" on your first exhale',
      'Count "2" on your second exhale',
      'Continue counting up to 10',
      'Start over at 1 if you reach 10',
      'If you lose count, gently start at 1'
    ],
    benefits: ['Improves concentration', 'Calms mind', 'Builds mindfulness'],
    tags: ['counting', 'mindfulness', 'concentration'],
    hapticPattern: 'gentle',
    crisisAppropriate: true
  },
  {
    id: 'breathing-007',
    title: 'Sighing Breath',
    category: 'breathing',
    duration: 90,
    difficulty: 'beginner',
    description: 'Natural stress relief through intentional sighing.',
    instructions: [
      'Take a normal breath in',
      'Take a second, smaller breath on top',
      'Let out a long, audible sigh',
      'Feel your shoulders drop',
      'Repeat 3-5 times',
      'Notice the immediate relief',
      'Return to normal breathing'
    ],
    benefits: ['Immediate stress relief', 'Releases tension', 'Resets nervous system'],
    tags: ['quick', 'relief', 'tension'],
    hapticPattern: 'gentle',
    crisisAppropriate: true
  },
  {
    id: 'breathing-008',
    title: 'Humming Breath',
    category: 'breathing',
    duration: 150,
    difficulty: 'beginner',
    description: 'Vibrating breath to create internal calm and focus.',
    instructions: [
      'Sit comfortably with eyes closed',
      'Take a deep breath in through your nose',
      'As you exhale, hum gently',
      'Feel the vibration in your chest and head',
      'Vary the pitch as feels good',
      'Continue for 2-3 minutes',
      'End with a few silent breaths'
    ],
    benefits: ['Creates internal vibration', 'Calms mind', 'Improves mood'],
    tags: ['vibration', 'mood', 'calming'],
    hapticPattern: 'rhythmic',
    crisisAppropriate: false
  },
  {
    id: 'breathing-009',
    title: 'Ocean Breath',
    category: 'breathing',
    duration: 240,
    difficulty: 'intermediate',
    description: 'Ujjayi breathing that sounds like ocean waves.',
    instructions: [
      'Sit with your spine tall',
      'Breathe in and out through your nose',
      'Slightly constrict your throat',
      'Create a soft "ocean" sound',
      'Keep the sound steady and smooth',
      'Match the length of inhale and exhale',
      'Continue for 3-4 minutes'
    ],
    benefits: ['Deep concentration', 'Internal heat', 'Calms nervous system'],
    tags: ['ocean', 'concentration', 'traditional'],
    hapticPattern: 'rhythmic',
    crisisAppropriate: false
  },
  {
    id: 'breathing-010',
    title: 'Cooling Breath',
    category: 'breathing',
    duration: 120,
    difficulty: 'intermediate',
    description: 'Breath technique to cool the body and calm anger.',
    instructions: [
      'Sit comfortably with eyes closed',
      'Curl your tongue into a tube shape',
      'Inhale slowly through your curled tongue',
      'Close your mouth and hold briefly',
      'Exhale slowly through your nose',
      'Feel the cooling sensation',
      'Repeat 8-10 times'
    ],
    benefits: ['Cools body temperature', 'Reduces anger', 'Calms Pitta dosha'],
    tags: ['cooling', 'anger', 'temperature'],
    hapticPattern: 'gentle',
    crisisAppropriate: false
  },

  // GROUNDING EXERCISES (10)
  {
    id: 'grounding-001',
    title: '5-4-3-2-1 Technique',
    category: 'grounding',
    duration: 180,
    difficulty: 'beginner',
    description: 'Use your senses to ground yourself in the present moment.',
    instructions: [
      'Look around and name 5 things you can see',
      'Notice 4 things you can touch',
      'Listen for 3 things you can hear',
      'Identify 2 things you can smell',
      'Think of 1 thing you can taste',
      'Take a deep breath',
      'Notice how you feel now'
    ],
    benefits: ['Reduces anxiety', 'Grounds in present', 'Interrupts panic'],
    tags: ['senses', 'anxiety', 'present'],
    hapticPattern: 'gentle',
    crisisAppropriate: true
  },
  {
    id: 'grounding-002',
    title: 'Body Scan',
    category: 'grounding',
    duration: 300,
    difficulty: 'beginner',
    description: 'Progressive awareness of your body from head to toe.',
    instructions: [
      'Lie down or sit comfortably',
      'Close your eyes and breathe naturally',
      'Start at the top of your head',
      'Notice any sensations without judgment',
      'Slowly move attention down your body',
      'Spend time with each body part',
      'End at your toes',
      'Take three deep breaths'
    ],
    benefits: ['Body awareness', 'Releases tension', 'Promotes relaxation'],
    tags: ['body', 'awareness', 'relaxation'],
    hapticPattern: 'gentle',
    crisisAppropriate: true
  },
  {
    id: 'grounding-003',
    title: 'Feet on Ground',
    category: 'grounding',
    duration: 90,
    difficulty: 'beginner',
    description: 'Simple grounding through connection with the earth.',
    instructions: [
      'Sit with both feet flat on the floor',
      'Remove shoes if possible',
      'Feel the weight of your feet',
      'Notice the temperature of the ground',
      'Press your feet down gently',
      'Imagine roots growing from your feet',
      'Feel supported by the earth'
    ],
    benefits: ['Immediate grounding', 'Reduces dissociation', 'Feels supported'],
    tags: ['earth', 'support', 'quick'],
    hapticPattern: 'gentle',
    crisisAppropriate: true
  },
  {
    id: 'grounding-004',
    title: 'Progressive Muscle Relaxation',
    category: 'grounding',
    duration: 480,
    difficulty: 'intermediate',
    description: 'Systematic tensing and releasing of muscle groups.',
    instructions: [
      'Lie down comfortably',
      'Start with your toes - tense for 5 seconds',
      'Release and notice the relaxation',
      'Move to your calves, then thighs',
      'Continue up through your body',
      'Include arms, shoulders, face',
      'End with your whole body relaxed',
      'Rest in the peaceful feeling'
    ],
    benefits: ['Deep muscle relaxation', 'Reduces physical tension', 'Improves sleep'],
    tags: ['muscle', 'tension', 'sleep'],
    hapticPattern: 'gentle',
    crisisAppropriate: false
  },
  {
    id: 'grounding-005',
    title: 'Temperature Awareness',
    category: 'grounding',
    duration: 120,
    difficulty: 'beginner',
    description: 'Use temperature to anchor yourself in your body.',
    instructions: [
      'Hold a warm cup or cool object',
      'Notice the temperature on your hands',
      'Feel how it spreads up your arms',
      'Pay attention to the contrast',
      'Switch between warm and cool if available',
      'Focus only on the physical sensation',
      'Let this anchor you in the present'
    ],
    benefits: ['Sensory grounding', 'Interrupts dissociation', 'Present moment'],
    tags: ['temperature', 'sensory', 'present'],
    hapticPattern: 'gentle',
    crisisAppropriate: true
  },
  {
    id: 'grounding-006',
    title: 'Texture Exploration',
    category: 'grounding',
    duration: 150,
    difficulty: 'beginner',
    description: 'Ground through touch and texture awareness.',
    instructions: [
      'Find objects with different textures',
      'Touch each one slowly and mindfully',
      'Notice rough, smooth, soft, hard',
      'Describe the texture in your mind',
      'Feel the object\'s weight and shape',
      'Compare different textures',
      'Return to your favorite texture'
    ],
    benefits: ['Tactile grounding', 'Sensory awareness', 'Calms nervous system'],
    tags: ['texture', 'touch', 'sensory'],
    hapticPattern: 'gentle',
    crisisAppropriate: true
  },
  {
    id: 'grounding-007',
    title: 'Mindful Walking',
    category: 'grounding',
    duration: 300,
    difficulty: 'beginner',
    description: 'Slow, deliberate walking with full attention.',
    instructions: [
      'Stand and feel your feet on the ground',
      'Take one very slow step',
      'Notice lifting, moving, placing',
      'Feel the shift of weight',
      'Continue with deliberate steps',
      'If your mind wanders, return to feet',
      'Walk for 5 minutes mindfully'
    ],
    benefits: ['Movement grounding', 'Mindful awareness', 'Gentle exercise'],
    tags: ['walking', 'movement', 'mindful'],
    hapticPattern: 'rhythmic',
    crisisAppropriate: true
  },
  {
    id: 'grounding-008',
    title: 'Safe Place Visualization',
    category: 'grounding',
    duration: 240,
    difficulty: 'intermediate',
    description: 'Create a mental sanctuary for emotional safety.',
    instructions: [
      'Close your eyes and breathe deeply',
      'Imagine a place where you feel completely safe',
      'It can be real or imaginary',
      'Notice all the details - colors, sounds, smells',
      'Feel the safety in your body',
      'Add anything that makes it more comfortable',
      'Know you can return here anytime'
    ],
    benefits: ['Emotional safety', 'Reduces anxiety', 'Creates inner resource'],
    tags: ['safety', 'visualization', 'comfort'],
    hapticPattern: 'gentle',
    crisisAppropriate: true
  },
  {
    id: 'grounding-009',
    title: 'Counting Objects',
    category: 'grounding',
    duration: 120,
    difficulty: 'beginner',
    description: 'Simple counting to focus and ground the mind.',
    instructions: [
      'Look around your environment',
      'Choose a type of object (books, plants, etc.)',
      'Count each one slowly',
      'Say the number out loud or in your head',
      'If you lose count, start over',
      'Try counting different objects',
      'Notice how this focuses your mind'
    ],
    benefits: ['Mental focus', 'Interrupts racing thoughts', 'Present moment'],
    tags: ['counting', 'focus', 'simple'],
    hapticPattern: 'gentle',
    crisisAppropriate: true
  },
  {
    id: 'grounding-010',
    title: 'Weighted Breathing',
    category: 'grounding',
    duration: 180,
    difficulty: 'beginner',
    description: 'Use weight and pressure for deep grounding.',
    instructions: [
      'Lie down with a pillow or blanket on your chest',
      'Feel the gentle weight',
      'Breathe slowly and deeply',
      'Notice how the weight moves with your breath',
      'Let the pressure calm your nervous system',
      'Focus on the sensation of being held',
      'Rest in this supported feeling'
    ],
    benefits: ['Deep pressure calming', 'Nervous system regulation', 'Feeling held'],
    tags: ['weight', 'pressure', 'support'],
    hapticPattern: 'gentle',
    crisisAppropriate: true
  },

  // COGNITIVE EXERCISES (10)
  {
    id: 'cognitive-001',
    title: 'Thought Labeling',
    category: 'cognitive',
    duration: 180,
    difficulty: 'beginner',
    description: 'Observe and label thoughts without judgment.',
    instructions: [
      'Sit quietly and close your eyes',
      'Notice when a thought arises',
      'Simply label it "thinking"',
      'Don\'t engage with the content',
      'Return attention to your breath',
      'When another thought comes, label it again',
      'Practice this gentle noticing'
    ],
    benefits: ['Reduces thought attachment', 'Builds awareness', 'Calms mental chatter'],
    tags: ['thoughts', 'awareness', 'mindfulness'],
    hapticPattern: 'gentle',
    crisisAppropriate: false
  },
  {
    id: 'cognitive-002',
    title: 'Gratitude Reflection',
    category: 'cognitive',
    duration: 240,
    difficulty: 'beginner',
    description: 'Shift focus to positive aspects of life.',
    instructions: [
      'Think of three things you\'re grateful for today',
      'Start with something small and simple',
      'Feel the appreciation in your body',
      'Think of someone who has helped you',
      'Appreciate something about yourself',
      'Notice how gratitude feels physically',
      'End with a moment of appreciation'
    ],
    benefits: ['Improves mood', 'Shifts perspective', 'Builds resilience'],
    tags: ['gratitude', 'positive', 'mood'],
    hapticPattern: 'gentle',
    crisisAppropriate: false
  },
  {
    id: 'cognitive-003',
    title: 'Loving-Kindness',
    category: 'cognitive',
    duration: 300,
    difficulty: 'intermediate',
    description: 'Cultivate compassion for self and others.',
    instructions: [
      'Sit comfortably and breathe naturally',
      'Start by sending kindness to yourself',
      'Say: "May I be happy, may I be peaceful"',
      'Think of someone you love',
      'Send them the same wishes',
      'Include someone neutral, then difficult',
      'End by including all beings'
    ],
    benefits: ['Increases compassion', 'Reduces anger', 'Improves relationships'],
    tags: ['compassion', 'kindness', 'relationships'],
    hapticPattern: 'gentle',
    crisisAppropriate: false
  },
  {
    id: 'cognitive-004',
    title: 'Worry Time',
    category: 'cognitive',
    duration: 300,
    difficulty: 'intermediate',
    description: 'Contain worries to a specific time period.',
    instructions: [
      'Set aside 5 minutes for worrying',
      'Write down or think about your concerns',
      'Allow yourself to fully worry during this time',
      'When time is up, say "worry time is over"',
      'If worries arise later, remind yourself to wait',
      'Schedule your next worry time',
      'Practice redirecting attention between sessions'
    ],
    benefits: ['Contains anxiety', 'Improves worry control', 'Reduces rumination'],
    tags: ['worry', 'anxiety', 'control'],
    hapticPattern: 'gentle',
    crisisAppropriate: false
  },
  {
    id: 'cognitive-005',
    title: 'Cognitive Reframing',
    category: 'cognitive',
    duration: 240,
    difficulty: 'intermediate',
    description: 'Challenge and reframe negative thought patterns.',
    instructions: [
      'Identify a negative thought you\'re having',
      'Ask: "Is this thought helpful or true?"',
      'Look for evidence for and against it',
      'Consider alternative perspectives',
      'Ask: "What would I tell a friend?"',
      'Create a more balanced thought',
      'Notice how the reframe feels'
    ],
    benefits: ['Challenges negative thinking', 'Improves mood', 'Builds resilience'],
    tags: ['reframing', 'thoughts', 'perspective'],
    hapticPattern: 'gentle',
    crisisAppropriate: false
  },
  {
    id: 'cognitive-006',
    title: 'Values Reflection',
    category: 'cognitive',
    duration: 300,
    difficulty: 'intermediate',
    description: 'Connect with your core values and purpose.',
    instructions: [
      'Think about what matters most to you',
      'Consider your core values (kindness, growth, etc.)',
      'Reflect on how you lived these values today',
      'Think of one small way to honor a value',
      'Imagine yourself living fully by your values',
      'Feel the sense of purpose this brings',
      'Commit to one value-based action'
    ],
    benefits: ['Clarifies purpose', 'Improves motivation', 'Guides decisions'],
    tags: ['values', 'purpose', 'meaning'],
    hapticPattern: 'gentle',
    crisisAppropriate: false
  },
  {
    id: 'cognitive-007',
    title: 'Self-Compassion Break',
    category: 'cognitive',
    duration: 180,
    difficulty: 'beginner',
    description: 'Practice kindness toward yourself in difficult moments.',
    instructions: [
      'Acknowledge that you\'re having a hard time',
      'Place your hand on your heart',
      'Say: "This is a moment of suffering"',
      'Remember: "Suffering is part of life"',
      'Say: "May I be kind to myself"',
      'Feel the warmth of your hand',
      'Offer yourself the compassion you need'
    ],
    benefits: ['Reduces self-criticism', 'Increases self-kindness', 'Emotional healing'],
    tags: ['self-compassion', 'kindness', 'healing'],
    hapticPattern: 'gentle',
    crisisAppropriate: true
  },
  {
    id: 'cognitive-008',
    title: 'Mindful Observation',
    category: 'cognitive',
    duration: 240,
    difficulty: 'beginner',
    description: 'Practice non-judgmental awareness of thoughts and feelings.',
    instructions: [
      'Sit quietly and notice what\'s happening inside',
      'Observe thoughts like clouds passing by',
      'Notice emotions without trying to change them',
      'Watch physical sensations with curiosity',
      'Practice saying "I notice..." instead of "I am..."',
      'Return to observing when you get caught up',
      'End with appreciation for your awareness'
    ],
    benefits: ['Builds mindfulness', 'Reduces reactivity', 'Increases awareness'],
    tags: ['mindfulness', 'observation', 'awareness'],
    hapticPattern: 'gentle',
    crisisAppropriate: false
  },
  {
    id: 'cognitive-009',
    title: 'Positive Affirmations',
    category: 'cognitive',
    duration: 120,
    difficulty: 'beginner',
    description: 'Use positive statements to shift mental patterns.',
    instructions: [
      'Choose an affirmation that resonates with you',
      'Examples: "I am enough" or "I can handle this"',
      'Repeat it slowly and mindfully',
      'Try to feel the truth of the words',
      'If resistance arises, that\'s normal',
      'Continue with gentle repetition',
      'End by taking the feeling into your day'
    ],
    benefits: ['Builds self-confidence', 'Shifts negative patterns', 'Improves self-talk'],
    tags: ['affirmations', 'confidence', 'positive'],
    hapticPattern: 'gentle',
    crisisAppropriate: false
  },
  {
    id: 'cognitive-010',
    title: 'Future Self Visualization',
    category: 'cognitive',
    duration: 300,
    difficulty: 'intermediate',
    description: 'Connect with your future self for guidance and hope.',
    instructions: [
      'Close your eyes and breathe deeply',
      'Imagine yourself one year from now',
      'See yourself having grown and healed',
      'Notice how this future you looks and feels',
      'Ask your future self for advice',
      'Listen to what they want to tell you',
      'Thank them and bring their wisdom back'
    ],
    benefits: ['Builds hope', 'Provides guidance', 'Motivates growth'],
    tags: ['future', 'hope', 'guidance'],
    hapticPattern: 'gentle',
    crisisAppropriate: false
  }
];

// Export categories for easy filtering
export const exerciseCategories = {
  breathing: exercises.filter(ex => ex.category === 'breathing'),
  grounding: exercises.filter(ex => ex.category === 'grounding'),
  cognitive: exercises.filter(ex => ex.category === 'cognitive'),
};

// Export crisis-appropriate exercises
export const crisisExercises = exercises.filter(ex => ex.crisisAppropriate);

// Export by difficulty
export const exercisesByDifficulty = {
  beginner: exercises.filter(ex => ex.difficulty === 'beginner'),
  intermediate: exercises.filter(ex => ex.difficulty === 'intermediate'),
  advanced: exercises.filter(ex => ex.difficulty === 'advanced'),
};
