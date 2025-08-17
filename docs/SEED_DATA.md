# 🌱 Seed Data Documentation for PocketTherapy

This document describes the seed data structure and implementation strategy for PocketTherapy's therapeutic content.

## 📁 Seed Data Files

All seed data is stored in `assets/content/` as JSON files for easy maintenance and localization.

### 1. Exercises (`exercises.json`)

**Schema**: 30 micro-CBT therapeutic exercises
```typescript
interface Exercise {
  id: string;                    // Unique identifier (e.g., "ex-breath-478-1")
  title: string;                 // Display name (e.g., "4-7-8 Breathing (Quick)")
  type: "breathing" | "grounding" | "cognitive";
  duration_minutes: number;      // Estimated completion time
  flags: {
    sos_safe: boolean;          // Safe for crisis situations
    night_safe: boolean;        // Safe for nighttime use
    offline_ready: boolean;     // Works without internet
  };
  steps: ExerciseStep[];
}

interface ExerciseStep {
  type: "text" | "breath" | "pause";
  content: string;              // Instruction text
  seconds?: number;             // Duration for breath/pause steps
}
```

**Categories**:
- **Breathing** (10 exercises): 4-7-8, Box Breathing, Paced Breathing, etc.
- **Grounding** (10 exercises): 5-4-3-2-1, Texture Focus, Hand Scan, etc.
- **Cognitive** (10 exercises): Evidence For/Against, Reframing, De-catastrophizing, etc.

**Safety Flags**:
- `sos_safe`: Appropriate for crisis/high-stress situations
- `night_safe`: Safe for bedtime/low-light use
- `offline_ready`: No external dependencies

### 2. Notifications (`notifications.json`)

**Schema**: 15 therapeutic notification templates
```typescript
interface NotificationTemplate {
  id: string;                   // Unique identifier
  text: string;                 // Notification message
  context: string[];            // Usage contexts
}
```

**Contexts**:
- `morning`: Morning check-ins
- `evening`: Evening wind-down
- `afternoon`: Peak stress times
- `night`: Bedtime notifications
- `study`: Study/exam support
- `social`: Social anxiety support
- `motivation`: Encouragement messages
- `sos_followup`: Post-crisis check-ins

**Therapeutic Tone**:
- Gentle, non-pressuring language
- Short, actionable prompts
- Emphasizes choice and autonomy
- Avoids clinical/medical terminology

### 3. Crisis Resources (`crisis_resources.json`)

**Schema**: Region-specific crisis support information
```typescript
interface CrisisResources {
  regions: CrisisRegion[];
}

interface CrisisRegion {
  country: string;              // ISO country code
  city?: string;                // Specific city/region
  resources: CrisisResource[];
  disclaimer: string;           // Legal/safety disclaimer
}

interface CrisisResource {
  name: string;                 // Organization name
  phone: string;                // Contact number
  hours: string;                // Availability
  notes: string;                // Additional information
}
```

**Current Regions**:
- **India (Bengaluru)**: Vandrevala Foundation, Aasra Helpline
- **US (National)**: 988 Lifeline, Crisis Text Line

## 🔄 Implementation Strategy

### Database Seeding Process

1. **App Initialization Check**
   ```typescript
   // Check if exercises table is empty
   const { count } = await supabase
     .from('exercises')
     .select('*', { count: 'exact', head: true });
   
   if (count === 0) {
     await seedExercises();
   }
   ```

2. **Exercise Seeding**
   ```typescript
   import exercisesData from '../assets/content/exercises.json';
   
   const seedExercises = async () => {
     const exercises = exercisesData.map(exercise => ({
       id: exercise.id,
       title: exercise.title,
       category: exercise.type,
       difficulty: 'beginner', // Default for seed data
       duration_seconds: exercise.duration_minutes * 60,
       steps: exercise.steps,
       tags: [exercise.type, ...Object.keys(exercise.flags).filter(key => exercise.flags[key])],
       is_active: true
     }));
     
     await supabase.from('exercises').upsert(exercises);
   };
   ```

3. **Local Content Caching**
   ```typescript
   // Cache crisis resources locally
   import crisisData from '../assets/content/crisis_resources.json';
   
   const getCrisisResources = (userLocation: string) => {
     // Select region based on device locale/timezone
     const region = crisisData.regions.find(r => 
       r.country === userLocation || r.city === userLocation
     ) || crisisData.regions[0]; // Fallback to first region
     
     return region;
   };
   ```

4. **Notification Scheduling**
   ```typescript
   import notificationsData from '../assets/content/notifications.json';
   
   const scheduleNotifications = async () => {
     // Default slots: 9:00 AM, 9:00 PM
     const morningNotifications = notificationsData.filter(n => 
       n.context.includes('morning')
     );
     const eveningNotifications = notificationsData.filter(n => 
       n.context.includes('evening')
     );
     
     // Schedule with user preferences
   };
   ```

### Content Localization Strategy

1. **File Structure**
   ```
   assets/content/
   ├── en/
   │   ├── exercises.json
   │   ├── notifications.json
   │   └── crisis_resources.json
   ├── hi/                     # Hindi translations
   │   ├── exercises.json
   │   └── notifications.json
   └── kn/                     # Kannada translations
       ├── exercises.json
       └── notifications.json
   ```

2. **Dynamic Loading**
   ```typescript
   const loadContent = async (locale: string = 'en') => {
     try {
       const exercises = await import(`../assets/content/${locale}/exercises.json`);
       return exercises.default;
     } catch {
       // Fallback to English
       const exercises = await import('../assets/content/en/exercises.json');
       return exercises.default;
     }
   };
   ```

## 🔧 Database Migration Scripts

### SQL Seed Scripts (Generated from JSON)

```sql
-- Insert breathing exercises
INSERT INTO exercises (id, title, category, difficulty, duration_seconds, steps, tags, is_active) VALUES
('ex-breath-478-1', '4-7-8 Breathing (Quick)', 'breathing', 'beginner', 120, 
 '[{"type":"text","content":"Sit comfortably. If safe, close your eyes."},{"type":"breath","content":"Inhale","seconds":4}]',
 ARRAY['breathing', 'sos_safe', 'night_safe', 'offline_ready'], true),
-- ... (additional exercises)

-- Insert grounding exercises
INSERT INTO exercises (id, title, category, difficulty, duration_seconds, steps, tags, is_active) VALUES
('ex-ground-54321-1', '5–4–3–2–1 Grounding', 'grounding', 'beginner', 180,
 '[{"type":"text","content":"Name 5 things you can see."}]',
 ARRAY['grounding', 'sos_safe', 'night_safe', 'offline_ready'], true),
-- ... (additional exercises)

-- Insert cognitive exercises
INSERT INTO exercises (id, title, category, difficulty, duration_seconds, steps, tags, is_active) VALUES
('ex-cogn-evidence-1', 'Evidence For / Against', 'cognitive', 'intermediate', 180,
 '[{"type":"text","content":"Write the worrying thought."}]',
 ARRAY['cognitive', 'night_safe', 'offline_ready'], true);
-- ... (additional exercises)
```

## 📊 Content Analytics

### Tracking Exercise Effectiveness

```typescript
interface ExerciseAnalytics {
  exercise_id: string;
  completion_rate: number;      // % of users who complete
  average_rating: number;       // 1-5 helpfulness rating
  usage_by_context: {
    sos: number;               // Usage during crisis
    routine: number;           // Regular practice
    night: number;             // Bedtime usage
  };
  user_feedback: string[];      // Common feedback themes
}
```

### A/B Testing Framework

```typescript
interface ContentVariant {
  id: string;
  type: 'exercise' | 'notification';
  variant_name: string;
  content: any;
  target_percentage: number;    // % of users to show this variant
  metrics: {
    engagement_rate: number;
    completion_rate: number;
    user_rating: number;
  };
}
```

## 🔒 Content Security

### Therapeutic Content Guidelines

1. **Safety First**
   - All exercises reviewed by mental health professionals
   - Crisis-safe content clearly marked
   - No medical advice or diagnosis

2. **Inclusive Language**
   - Gender-neutral pronouns
   - Culturally sensitive content
   - Accessibility considerations

3. **Evidence-Based**
   - CBT and mindfulness techniques
   - Peer-reviewed research backing
   - Regular content updates

### Content Moderation

```typescript
interface ContentReview {
  content_id: string;
  reviewer_id: string;
  review_date: string;
  safety_rating: 1 | 2 | 3 | 4 | 5;  // 5 = completely safe
  therapeutic_value: 1 | 2 | 3 | 4 | 5;
  accessibility_score: 1 | 2 | 3 | 4 | 5;
  notes: string;
  approved: boolean;
}
```

## 🚀 Future Enhancements

### Personalized Content

1. **AI-Generated Exercises**
   - OpenAI integration for custom exercises
   - User preference-based generation
   - Safety validation pipeline

2. **Adaptive Notifications**
   - Machine learning for optimal timing
   - Mood-based message selection
   - Engagement optimization

3. **Community Content**
   - User-submitted exercises (moderated)
   - Peer rating system
   - Cultural adaptation crowdsourcing

This seed data provides a solid foundation for PocketTherapy's therapeutic content while maintaining flexibility for future expansion and localization.
