# Compliance & Safety Requirements

## Overview
PocketTherapy implements comprehensive compliance and safety measures to ensure responsible deployment of mental health technology while protecting user privacy and safety.

## Regulatory Compliance

### India Compliance (Primary Market)
```typescript
const INDIA_COMPLIANCE = {
  data_protection: {
    framework: 'Personal Data Protection Bill',
    requirements: [
      'explicit_user_consent',
      'data_minimization',
      'purpose_limitation',
      'right_to_deletion',
      'data_portability'
    ]
  },
  
  medical_disclaimers: {
    required: true,
    placement: ['app_launch', 'crisis_screens', 'exercise_player'],
    language: 'clear_non_medical_positioning'
  },
  
  age_verification: {
    minimum_age: 18,
    verification_method: 'birth_year_input',
    underage_resources: 'teen_specific_helplines'
  },
  
  emergency_services: {
    primary: '112', // National Emergency Number
    mental_health_specific: [
      'Vandrevala Foundation: 1860 2662 345',
      'Aasra Helpline: 91-9820466726',
      'iCall: 9152987821'
    ]
  }
};
```

### US Compliance (Secondary Market)
```typescript
const US_COMPLIANCE = {
  hipaa_considerations: {
    covered_entity: false, // Wellness app, not healthcare provider
    voluntary_protections: true, // Apply HIPAA-level privacy voluntarily
    requirements: [
      'user_consent_for_data_collection',
      'right_to_data_portability',
      'right_to_deletion',
      'breach_notification_procedures'
    ]
  },
  
  fda_considerations: {
    medical_device: false, // Wellness app, not medical device
    content_restrictions: [
      'no_diagnostic_claims',
      'no_treatment_claims',
      'focus_on_wellness_and_coping',
      'avoid_clinical_language'
    ]
  },
  
  emergency_services: {
    primary: '911',
    mental_health_specific: [
      'National Suicide Prevention Lifeline: 988',
      'Crisis Text Line: Text HOME to 741741',
      'SAMHSA Helpline: 1-800-662-4357'
    ]
  }
};
```

## Legal Disclaimers

### Required Disclaimer Text
```typescript
const CRISIS_DISCLAIMERS = {
  sos_screen: {
    text: "If you are in immediate danger, please contact emergency services (112) or go to your nearest emergency room.",
    prominence: "large_bold_text",
    placement: "top_of_crisis_resources",
    color: "crisis_urgent_color"
  },
  
  app_launch: {
    text: "PocketTherapy provides emotional support tools. It is not a substitute for professional mental health care.",
    acceptance_required: true,
    frequency: "first_launch_and_monthly",
    legal_language: "By using this app, you acknowledge that PocketTherapy is not a medical device and should not replace professional mental health treatment."
  },
  
  exercise_player: {
    text: "These exercises are for emotional wellness. If you're having thoughts of self-harm, please seek immediate professional help.",
    placement: "before_crisis_detection_exercises",
    dismissible: false
  },
  
  ai_features: {
    text: "AI recommendations are for general wellness and should not be considered professional advice.",
    placement: "before_ai_generated_content",
    frequency: "first_use_and_weekly"
  }
};
```

### Disclaimer Implementation
```typescript
const showCrisisDisclaimer = (): Promise<boolean> => {
  return new Promise((resolve) => {
    showModal({
      title: "Important Safety Information",
      content: CRISIS_DISCLAIMERS.app_launch.text,
      legalText: CRISIS_DISCLAIMERS.app_launch.legal_language,
      buttons: [
        { 
          text: "I understand", 
          action: () => {
            logDisclaimerAcceptance('app_launch');
            resolve(true);
          }
        },
        { 
          text: "Get professional help", 
          action: () => {
            showCrisisResources();
            resolve(false);
          }
        }
      ],
      dismissible: false, // User must acknowledge
      accessibility: {
        screenReaderText: "Important safety disclaimer about app limitations",
        focusOnShow: true
      }
    });
  });
};

const logDisclaimerAcceptance = (type: string) => {
  AsyncStorage.setItem(`disclaimer_${type}_accepted`, JSON.stringify({
    timestamp: Date.now(),
    version: '1.0',
    userAgent: Platform.OS
  }));
};
```

## Crisis Data Handling

### Privacy-First Crisis Data Policy
```typescript
const CRISIS_DATA_POLICY = {
  keyword_detection: {
    storage: 'local_device_only',
    server_transmission: 'never',
    analytics: 'anonymized_count_only',
    user_control: 'can_disable_in_settings'
  },
  
  crisis_event_logging: {
    purpose: 'safety_monitoring_and_improvement',
    data_stored: [
      'timestamp',
      'crisis_level', // 'IMMEDIATE' or 'MODERATE'
      'user_actions_taken', // ['viewed_resources', 'started_breathing']
      'session_id' // Anonymous session identifier
    ],
    data_excluded: [
      'user_text_content',
      'personal_identifiers',
      'location_data',
      'device_identifiers'
    ],
    retention_period: '30_days_maximum',
    anonymization: 'immediate'
  },
  
  emergency_contact_usage: {
    storage: 'encrypted_local_keychain',
    sharing: 'only_when_user_initiates_call',
    backup: 'never_to_cloud_without_explicit_consent',
    access: 'biometric_or_pin_protected'
  }
};
```

### Crisis Event Logging Implementation
```typescript
const logCrisisEvent = (level: CrisisLevel, userActions: string[]) => {
  const safeLog = {
    event_id: generateUUID(),
    timestamp: Date.now(),
    crisis_level: level,
    user_actions: userActions,
    session_id: getAnonymousSessionId(),
    app_version: getAppVersion(),
    // Explicitly NOT logging: user_text, mood_content, personal_data
  };
  
  // Store locally for safety monitoring
  AsyncStorage.setItem('crisis_events', JSON.stringify(safeLog));
  
  // Send anonymized aggregate to improve crisis support
  Analytics.track('crisis_support_usage', {
    level: level,
    effective_resources: userActions.length > 0,
    timestamp: Date.now(),
    // No personal information transmitted
  });
};

const getAnonymousSessionId = (): string => {
  // Generate session-specific anonymous ID
  const sessionStart = AsyncStorage.getItem('session_start') || Date.now();
  return hashString(`${sessionStart}_${Platform.OS}_${getAppVersion()}`);
};
```

## Age Verification

### Gentle Age Verification Implementation
```typescript
const AgeVerification: React.FC = () => {
  const [birthYear, setBirthYear] = useState('');
  const [showUnderageFlow, setShowUnderageFlow] = useState(false);
  
  const verifyAge = () => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(birthYear);
    
    if (age >= 18 && age <= 100) {
      // Valid adult age
      AsyncStorage.setItem('age_verified', JSON.stringify({
        verified: true,
        timestamp: Date.now(),
        age_range: getAgeRange(age) // '18-25', '26-35', etc.
      }));
      navigateToOnboarding();
    } else if (age < 18) {
      // Underage user
      setShowUnderageFlow(true);
    } else {
      // Invalid age
      showAgeError();
    }
  };
  
  if (showUnderageFlow) {
    return <UnderageResourcesScreen />;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to PocketTherapy</Text>
      <Text style={styles.subtitle}>
        To personalize your experience{'\n'}
        What year were you born?
      </Text>
      
      <TextInput
        style={styles.yearInput}
        value={birthYear}
        onChangeText={setBirthYear}
        placeholder="YYYY"
        keyboardType="numeric"
        maxLength={4}
        accessibilityLabel="Birth year input"
        accessibilityHint="Enter your birth year to verify you are 18 or older"
      />
      
      <TherapeuticButton
        title="Continue"
        onPress={verifyAge}
        disabled={birthYear.length !== 4}
        variant="primary"
      />
    </View>
  );
};

const UnderageResourcesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>We want to help</Text>
      <Text style={styles.message}>
        PocketTherapy is designed for adults 18+. Here are some resources specifically for teens:
      </Text>
      
      <View style={styles.resourcesList}>
        <ResourceCard
          name="Teen Line"
          phone="310-855-4673"
          description="Confidential support for teens"
        />
        <ResourceCard
          name="Kids Helpline (India)"
          phone="1800-55-1800"
          description="24/7 support for children and teens"
        />
        <ResourceCard
          name="Crisis Text Line"
          phone="Text HOME to 741741"
          description="24/7 crisis support via text"
        />
      </View>
      
      <TherapeuticButton
        title="Call for Help"
        onPress={() => callEmergencyServices()}
        variant="crisis"
      />
    </View>
  );
};
```

## Content Moderation

### User-Generated Content Safety
```typescript
const moderateUserContent = (content: string): ModerationResult => {
  const moderationChecks = {
    // Crisis content detection (handled separately)
    crisis_detected: detectCrisisLevel(content).level !== 'NONE',
    
    // Inappropriate content
    contains_profanity: checkProfanity(content),
    contains_spam: checkSpamPatterns(content),
    contains_personal_info: checkPersonalInfo(content),
    
    // Length and format validation
    appropriate_length: content.length > 0 && content.length <= 500,
    valid_format: !containsHTMLOrScripts(content)
  };
  
  return {
    approved: Object.values(moderationChecks).every(check => 
      typeof check === 'boolean' ? check : true
    ),
    flags: Object.entries(moderationChecks)
      .filter(([key, value]) => value === false)
      .map(([key]) => key),
    sanitized_content: sanitizeContent(content)
  };
};

interface ModerationResult {
  approved: boolean;
  flags: string[];
  sanitized_content: string;
}
```

## Data Protection Implementation

### Privacy Controls Interface
```typescript
const PrivacyControlsScreen: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings>();
  
  return (
    <ScrollView style={styles.container}>
      <Section title="Data Collection">
        <ToggleOption
          title="Mood tracking analytics"
          description="Help improve the app with anonymized mood patterns"
          value={settings?.analytics_enabled}
          onChange={(value) => updatePrivacySetting('analytics_enabled', value)}
        />
        
        <ToggleOption
          title="Crisis detection"
          description="Scan your notes for crisis keywords (processed locally)"
          value={settings?.crisis_detection_enabled}
          onChange={(value) => updatePrivacySetting('crisis_detection_enabled', value)}
        />
      </Section>
      
      <Section title="Data Storage">
        <ToggleOption
          title="Cloud backup"
          description="Backup your data to the cloud for access across devices"
          value={settings?.cloud_backup_enabled}
          onChange={(value) => updatePrivacySetting('cloud_backup_enabled', value)}
        />
        
        <Button
          title="Export my data"
          onPress={exportUserData}
          variant="secondary"
        />
        
        <Button
          title="Delete all data"
          onPress={showDataDeletionConfirmation}
          variant="outline"
          textColor="error"
        />
      </Section>
    </ScrollView>
  );
};
```

This comprehensive compliance and safety framework ensures PocketTherapy operates responsibly while providing effective mental health support to users across different regulatory environments.
